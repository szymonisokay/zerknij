package expo.modules.zerknijtimer

import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import java.lang.ref.WeakReference

/** Wszystko, co dzieje się po zmianie stanu sesji. */
object Effects {
  /** Zdarzenia starsze niż to (np. nadrobione po ubiciu procesu) nie dzwonią. */
  private const val FRESH_MS = 10_000L

  fun apply(context: Context, previous: Session?, next: Session?, events: List<TimerEvent>) {
    val last = events.lastOrNull()
    if (last != null && System.currentTimeMillis() - last.at < FRESH_MS) Signals.forEvent(context, last.type)

    if (next?.phase == Phase.BREAK && last?.type == EventType.BREAK_START && !Timer.appVisible) {
      Notifications.showBreak(context, next, fullScreen = Timer.config.fullScreenBreak)
    }
    if (next?.phase != Phase.BREAK) Notifications.cancelBreak(context)
    if (last?.type == EventType.END && previous?.notifyOnEnd == true) Notifications.showEnd(context)

    Alarms.schedule(context, next)
    if (next != null) TimerService.ensureRunning(context) else TimerService.stop(context)
    LockScreen.update()
  }
}

/** Alarm budzący telefon dokładnie na koniec fazy (także przy zgaszonym ekranie i w trybie Doze). */
object Alarms {
  fun schedule(context: Context, session: Session?) {
    val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return
    val operation = PendingIntent.getBroadcast(
      context,
      0,
      Intent(context, AlarmReceiver::class.java),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
    val at = session?.let { if (it.paused) it.stopAt else minOf(it.endsAt, it.stopAt ?: Long.MAX_VALUE) }
    if (at == null) {
      alarmManager.cancel(operation)
      return
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, operation)
      return
    }
    alarmManager.setAlarmClock(AlarmManager.AlarmClockInfo(at, Notifications.openApp(context)), operation)
  }
}

object Signals {
  private var ringtone: Ringtone? = null

  fun forEvent(context: Context, type: EventType) {
    val config = Timer.config
    if (config.sound) play(context, if (type == EventType.BREAK_START) config.breakStartSound else config.breakEndSound)
    if (config.vibration) vibrate(context)
  }

  private fun play(context: Context, uri: String?) {
    val sound = uri?.let(Uri::parse) ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION) ?: return
    ringtone?.stop()
    ringtone = RingtoneManager.getRingtone(context, sound)?.apply {
      audioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      play()
    }
  }

  private fun vibrate(context: Context) {
    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      context.getSystemService(VibratorManager::class.java)?.defaultVibrator
    } else {
      context.getSystemService(Vibrator::class.java)
    } ?: return
    val pattern = longArrayOf(0, 250, 150, 250)
    when {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU -> vibrator.vibrate(
        VibrationEffect.createWaveform(pattern, -1),
        VibrationAttributes.createForUsage(VibrationAttributes.USAGE_NOTIFICATION),
      )
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O -> vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
      else -> vibrator.vibrate(pattern, -1)
    }
  }

  /** Nazwa dźwięku do pokazania w ustawieniach („Bright Morning”). */
  fun title(context: Context, uri: String?): String? =
    uri?.let { runCatching { RingtoneManager.getRingtone(context, Uri.parse(it))?.getTitle(context) }.getOrNull() }
}

/**
 * Pokazywanie ekranu przerwy na ekranie blokady. Flagi ustawiamy na aktywności tylko na czas
 * przerwy (i gdy włączone „Pokaż na pełnym ekranie”) – poza przerwą aplikacja zachowuje się normalnie.
 */
object LockScreen {
  private var activity: WeakReference<Activity>? = null

  fun attach(activity: Activity) {
    this.activity = WeakReference(activity)
    update()
  }

  fun update() {
    val target = activity?.get() ?: return
    val show = Timer.session?.phase == Phase.BREAK && Timer.config.fullScreenBreak
    target.runOnUiThread {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        target.setShowWhenLocked(show)
        target.setTurnScreenOn(show)
      } else {
        @Suppress("DEPRECATION")
        val flags = WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        if (show) target.window.addFlags(flags) else target.window.clearFlags(flags)
      }
    }
  }
}

object Format {
  /** 872 → "14:32" */
  fun clock(sec: Long) = "%d:%02d".format(sec / 60, sec % 60)

  /** 20 → "20 s", 60 → "1 min", 90 → "1 min 30 s" */
  fun breakLabel(sec: Long) = when {
    sec < 60 -> "$sec s"
    sec % 60 == 0L -> "${sec / 60} min"
    else -> "${sec / 60} min ${sec % 60} s"
  }

  /** Odliczanie przerwy: "14 s" albo "1:05". */
  fun breakCountdown(sec: Long) = if (sec < 60) "$sec s" else clock(sec)
}
