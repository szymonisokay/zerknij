package expo.modules.zerknijtimer

import android.app.KeyguardManager
import android.app.Notification
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

/**
 * Usługa pierwszoplanowa na czas sesji: trzyma stałe powiadomienie, odświeża je co sekundę
 * przy włączonym ekranie i reaguje na wygaszenie/odblokowanie ekranu. Fazy przy zgaszonym
 * ekranie przełącza alarm (AlarmReceiver).
 */
class TimerService : Service() {
  companion object {
    const val ACTION_TOGGLE_PAUSE = "expo.modules.zerknijtimer.TOGGLE_PAUSE"
    const val ACTION_BREAK_NOW = "expo.modules.zerknijtimer.BREAK_NOW"
    const val ACTION_SKIP = "expo.modules.zerknijtimer.SKIP"
    const val ACTION_SNOOZE = "expo.modules.zerknijtimer.SNOOZE"
    const val ACTION_STOP = "expo.modules.zerknijtimer.STOP"

    @Volatile
    private var instance: TimerService? = null

    fun ensureRunning(context: Context) {
      instance?.let {
        it.refresh()
        return
      }
      try {
        ContextCompat.startForegroundService(context, Intent(context, TimerService::class.java))
      } catch (e: Exception) {
        Log.w("ZerknijTimer", "Nie udało się uruchomić usługi", e)
      }
    }

    fun stop(context: Context) {
      instance?.shutdown() ?: context.stopService(Intent(context, TimerService::class.java))
    }
  }

  private val handler = Handler(Looper.getMainLooper())
  private var ticking = false

  private val tick = object : Runnable {
    override fun run() {
      Timer.sync(this@TimerService)
      refresh()
      if (ticking) handler.postDelayed(this, 1000 - System.currentTimeMillis() % 1000 + 15)
    }
  }

  private val screenReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      when (intent.action) {
        Intent.ACTION_SCREEN_OFF -> {
          stopTicking()
          Timer.onScreenOff(context)
        }
        Intent.ACTION_SCREEN_ON -> {
          startTicking()
          val keyguard = context.getSystemService(KeyguardManager::class.java)
          if (keyguard?.isKeyguardLocked != true) Timer.onUnlock(context)
        }
        Intent.ACTION_USER_PRESENT -> Timer.onUnlock(context)
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    instance = this
    Timer.init(this)
    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_SCREEN_OFF)
      addAction(Intent.ACTION_SCREEN_ON)
      addAction(Intent.ACTION_USER_PRESENT)
    }
    // USER_PRESENT wysyła SystemUI (nie proces systemowy), więc odbiornik nieeksportowany by go pominął.
    // To chronione zdarzenia – inne aplikacje i tak nie mogą ich wysłać.
    ContextCompat.registerReceiver(this, screenReceiver, filter, ContextCompat.RECEIVER_EXPORTED)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Timer.init(this)
    val session = Timer.session
    if (session == null) {
      // Usługa uruchomiona przez startForegroundService musi wejść na pierwszy plan, zanim się zatrzyma.
      startInForeground(Notifications.idle(this))
      shutdown()
      return START_NOT_STICKY
    }
    startInForeground(Notifications.session(this, session))

    when (intent?.action) {
      ACTION_TOGGLE_PAUSE -> Timer.togglePause(this)
      ACTION_BREAK_NOW -> Timer.breakNow(this)
      ACTION_SKIP -> Timer.skipBreak(this)
      ACTION_SNOOZE -> Timer.snoozeBreak(this)
      ACTION_STOP -> Timer.stop(this)
      else -> Timer.sync(this)
    }

    if (getSystemService(PowerManager::class.java)?.isInteractive == true) startTicking()
    return START_STICKY
  }

  override fun onDestroy() {
    instance = null
    stopTicking()
    unregisterReceiver(screenReceiver)
    super.onDestroy()
  }

  fun refresh() {
    val session = Timer.session ?: return
    getSystemService(NotificationManager::class.java)
      ?.notify(Notifications.SESSION_ID, Notifications.session(this, session))
  }

  private fun startInForeground(notification: Notification) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceCompat.startForeground(
        this,
        Notifications.SESSION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
      )
    } else {
      startForeground(Notifications.SESSION_ID, notification)
    }
  }

  private fun shutdown() {
    stopTicking()
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun startTicking() {
    if (ticking) return
    ticking = true
    handler.post(tick)
  }

  private fun stopTicking() {
    ticking = false
    handler.removeCallbacks(tick)
  }
}

/** Alarm na koniec fazy: przesuwa sesję i (w razie potrzeby) podnosi usługę. */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    Timer.init(context)
    Timer.sync(context)
    if (Timer.session != null) TimerService.ensureRunning(context)
  }
}

/**
 * Restart telefonu kasuje alarmy, a aktualizacja aplikacji zabija usługę. Po obu zdarzeniach
 * przywracamy trwającą sesję (nadrabiając fazy, które minęły w międzyczasie).
 */
class RestoreReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
    Timer.init(context)
    Timer.restore(context)
  }
}
