package expo.modules.zerknijtimer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import kotlin.math.ceil

object Notifications {
  const val SESSION_ID = 1
  private const val BREAK_ID = 2
  private const val END_ID = 3

  private const val CHANNEL_SESSION = "session"
  private const val CHANNEL_ALERTS = "alerts"

  private val WORK = Color.parseColor("#7DD3A8")
  private val BREAK = Color.parseColor("#F4B860")

  /** Stałe powiadomienie usługi: odliczanie, pasek postępu i przyciski. */
  fun session(context: Context, s: Session, now: Long = System.currentTimeMillis()): Notification {
    ensureChannels(context)
    val left = s.timeLeft(now)
    val leftSec = ceil(left / 1000.0).toLong()
    val isBreak = s.phase == Phase.BREAK
    val phaseName = when {
      s.paused -> "Pauza"
      isBreak -> "Przerwa"
      else -> "Praca"
    }
    val cycle = if (s.maxCycles != null) "cykl ${s.cycle} z ${s.maxCycles}" else "cykl ${s.cycle}"
    val title = when {
      isBreak && s.paused -> "Przerwa wstrzymana · ${Format.breakCountdown(leftSec)}"
      isBreak -> "Spójrz w dal – ${Format.breakCountdown(leftSec)}"
      s.paused -> "Wstrzymane · do przerwy ${Format.clock(leftSec)}"
      else -> "Przerwa za ${Format.clock(leftSec)}"
    }
    val text =
      if (isBreak) "Coś oddalonego o ok. 6 m. Wrócimy sami."
      else "${s.workMs / 60_000} min / ${Format.breakLabel(s.breakMs / 1000)}"
    val elapsed = 1 - left.toDouble() / s.phaseMs

    val builder = NotificationCompat.Builder(context, CHANNEL_SESSION)
      .setSmallIcon(R.drawable.zerknij_notification)
      .setColor(if (isBreak) BREAK else WORK)
      .setSubText("$phaseName · $cycle")
      .setContentTitle(title)
      .setContentText(text)
      .setProgress(1000, (elapsed * 1000).toInt(), false)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setCategory(NotificationCompat.CATEGORY_PROGRESS)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setContentIntent(openApp(context))
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)

    when {
      isBreak -> builder
        .addAction(0, "Pomiń przerwę", serviceAction(context, TimerService.ACTION_SKIP))
        .addAction(0, "Za 5 min", serviceAction(context, TimerService.ACTION_SNOOZE))
        .addAction(0, "Stop", serviceAction(context, TimerService.ACTION_STOP))
      s.paused -> builder
        .addAction(0, "Wznów", serviceAction(context, TimerService.ACTION_TOGGLE_PAUSE))
        .addAction(0, "Stop", serviceAction(context, TimerService.ACTION_STOP))
      else -> builder
        .addAction(0, "Pauza", serviceAction(context, TimerService.ACTION_TOGGLE_PAUSE))
        .addAction(0, "Przerwa teraz", serviceAction(context, TimerService.ACTION_BREAK_NOW))
        .addAction(0, "Stop", serviceAction(context, TimerService.ACTION_STOP))
    }
    return builder.build()
  }

  /** Początek przerwy: wyskakujące powiadomienie, a przy zablokowanym telefonie – ekran przerwy. */
  fun showBreak(context: Context, s: Session, fullScreen: Boolean) {
    ensureChannels(context)
    val builder = NotificationCompat.Builder(context, CHANNEL_ALERTS)
      .setSmallIcon(R.drawable.zerknij_notification)
      .setColor(BREAK)
      .setSubText("Przerwa")
      .setContentTitle("Spójrz w dal – ${Format.breakLabel(s.breakMs / 1000)}")
      .setContentText("Coś oddalonego o ok. 6 m. Wrócimy sami.")
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setAutoCancel(true)
      .setTimeoutAfter(s.breakMs)
      .setContentIntent(openApp(context))
      .addAction(0, "Pomiń", serviceAction(context, TimerService.ACTION_SKIP))
      .addAction(0, "Za 5 min", serviceAction(context, TimerService.ACTION_SNOOZE))
      .addAction(0, "Otwórz", openApp(context))
    if (fullScreen) builder.setFullScreenIntent(openApp(context, requestCode = 1), true)
    manager(context).notify(BREAK_ID, builder.build())
  }

  fun cancelBreak(context: Context) = manager(context).cancel(BREAK_ID)

  fun showEnd(context: Context) {
    ensureChannels(context)
    val notification = NotificationCompat.Builder(context, CHANNEL_ALERTS)
      .setSmallIcon(R.drawable.zerknij_notification)
      .setColor(WORK)
      .setContentTitle("Koniec sesji")
      .setContentText("Timer się zatrzymał. Dobra robota!")
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setContentIntent(openApp(context))
      .build()
    manager(context).notify(END_ID, notification)
  }

  /** Zastępcze powiadomienie, gdy usługa wstaje już po końcu sesji. */
  fun idle(context: Context): Notification {
    ensureChannels(context)
    return NotificationCompat.Builder(context, CHANNEL_SESSION)
      .setSmallIcon(R.drawable.zerknij_notification)
      .setContentTitle("Zerknij")
      .build()
  }

  fun openApp(context: Context, requestCode: Int = 0): PendingIntent {
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?: Intent().setPackage(context.packageName)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    return PendingIntent.getActivity(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }

  private fun serviceAction(context: Context, action: String): PendingIntent = PendingIntent.getService(
    context,
    action.hashCode(),
    Intent(context, TimerService::class.java).setAction(action),
    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
  )

  private fun manager(context: Context) = context.getSystemService(NotificationManager::class.java)

  private fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = manager(context)
    if (manager.getNotificationChannel(CHANNEL_ALERTS) != null) return
    // Dźwięk i wibrację odtwarzamy sami (Signals), więc kanały są ciche – zmiana dźwięku nie wymaga nowego kanału.
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_SESSION, "Odliczanie", NotificationManager.IMPORTANCE_LOW).apply {
        description = "Stałe powiadomienie z czasem do przerwy"
        setShowBadge(false)
        setSound(null, null)
        enableVibration(false)
      },
    )
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_ALERTS, "Przerwy", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "Początek przerwy i koniec sesji"
        setSound(null, null)
        enableVibration(false)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      },
    )
  }
}
