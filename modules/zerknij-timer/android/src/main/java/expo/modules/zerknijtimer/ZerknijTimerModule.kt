package expo.modules.zerknijtimer

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class StartOptions : Record {
  @Field val workMs: Double = 0.0
  @Field val breakMs: Double = 0.0
  @Field val maxCycles: Double? = null
  @Field val stopAt: Double? = null
  @Field val notifyOnEnd: Boolean = false
}

class ConfigOptions : Record {
  @Field val sound: Boolean = true
  @Field val vibration: Boolean = true
  @Field val breakStartSound: String? = null
  @Field val breakEndSound: String? = null
  @Field val fullScreenBreak: Boolean = true
  @Field val pauseOnScreenOff: Boolean = false
}

class ZerknijTimerModule : Module() {
  private val pickSoundRequest = 4201
  private var pickSoundPromise: Promise? = null

  private val onChange: () -> Unit = { sendEvent("onChange", Timer.snapshot()) }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "Brak kontekstu React" }

  override fun definition() = ModuleDefinition {
    Name("ZerknijTimer")

    Events("onChange")

    OnCreate {
      Timer.init(context)
      Timer.listeners.add(onChange)
    }

    OnDestroy {
      Timer.listeners.remove(onChange)
    }

    Function("getState") { Timer.snapshot() }

    Function("sync") {
      Timer.sync(context)
      Timer.snapshot()
    }

    Function("start") { options: StartOptions ->
      Timer.start(
        context,
        options.workMs.toLong(),
        options.breakMs.toLong(),
        options.maxCycles?.toInt(),
        options.stopAt?.toLong(),
        options.notifyOnEnd,
      )
      Timer.snapshot()
    }

    Function("togglePause") {
      Timer.togglePause(context)
      Timer.snapshot()
    }

    Function("breakNow") {
      Timer.breakNow(context)
      Timer.snapshot()
    }

    Function("skipBreak") {
      Timer.skipBreak(context)
      Timer.snapshot()
    }

    Function("snoozeBreak") {
      Timer.snoozeBreak(context)
      Timer.snapshot()
    }

    Function("stop") {
      Timer.stop(context)
      Timer.snapshot()
    }

    Function("setConfig") { options: ConfigOptions ->
      Timer.setConfig(
        context,
        Config(
          sound = options.sound,
          vibration = options.vibration,
          breakStartSound = options.breakStartSound,
          breakEndSound = options.breakEndSound,
          fullScreenBreak = options.fullScreenBreak,
          pauseOnScreenOff = options.pauseOnScreenOff,
        ),
      )
    }

    /** Czy system pozwala działać w tle bez ograniczeń baterii (ważne zwłaszcza na Samsungach). */
    Function("isBackgroundUnrestricted") {
      context.getSystemService(PowerManager::class.java)?.isIgnoringBatteryOptimizations(context.packageName) == true
    }

    /** Systemowe okno „Zezwolić na działanie w tle?” dla tej aplikacji. */
    Function("requestBackgroundUnrestricted") {
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:${context.packageName}"))
      (appContext.currentActivity ?: return@Function false).startActivity(intent)
      true
    }

    /** Systemowy wybór dźwięku. Zwraca { uri, title } albo null, gdy anulowano. */
    AsyncFunction("pickSound") { currentUri: String?, promise: Promise ->
      val activity = appContext.currentActivity
        ?: return@AsyncFunction promise.reject(CodedException("Brak aktywnej aktywności"))
      pickSoundPromise?.resolve(null)
      pickSoundPromise = promise
      val existing = currentUri?.let(Uri::parse) ?: Settings.System.DEFAULT_NOTIFICATION_URI
      val intent = Intent(RingtoneManager.ACTION_RINGTONE_PICKER)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_NOTIFICATION)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, existing)
      activity.startActivityForResult(intent, pickSoundRequest)
    }.runOnQueue(Queues.MAIN)

    OnActivityResult { _, payload ->
      if (payload.requestCode != pickSoundRequest) return@OnActivityResult
      val promise = pickSoundPromise ?: return@OnActivityResult
      pickSoundPromise = null
      val uri = payload.data?.pickedUri()
      if (payload.resultCode != Activity.RESULT_OK || uri == null) {
        promise.resolve(null)
        return@OnActivityResult
      }
      // Domyślny dźwięk zapisujemy jako null – wtedy zawsze gra bieżący domyślny dźwięk systemu.
      val isDefault = RingtoneManager.isDefault(uri)
      promise.resolve(
        mapOf(
          "uri" to if (isDefault) null else uri.toString(),
          "title" to if (isDefault) null else Signals.title(context, uri.toString()),
        ),
      )
    }
  }

  private fun Intent.pickedUri(): Uri? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri::class.java)
    } else {
      @Suppress("DEPRECATION")
      getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
    }
}
