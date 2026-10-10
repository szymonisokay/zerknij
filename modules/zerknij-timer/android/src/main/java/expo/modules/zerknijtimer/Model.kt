package expo.modules.zerknijtimer

import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class Phase(val id: String) { WORK("work"), BREAK("break") }

data class Session(
  val phase: Phase,
  /** Numer bieżącego cyklu (praca + przerwa), od 1. */
  val cycle: Int,
  val workMs: Long,
  val breakMs: Long,
  /** Kiedy kończy się bieżąca faza (gdy timer działa). */
  val endsAt: Long,
  /** Ile zostało z fazy w chwili pauzy; null = timer działa. */
  val pausedLeft: Long?,
  /** Pauza włączona automatycznie po zgaszeniu ekranu – zdejmujemy ją po odblokowaniu. */
  val autoPaused: Boolean,
  val startedAt: Long,
  val maxCycles: Int?,
  val stopAt: Long?,
  val notifyOnEnd: Boolean,
) {
  val paused: Boolean get() = pausedLeft != null
  val isLastCycle: Boolean get() = maxCycles != null && cycle >= maxCycles
  val phaseLength: Long get() = if (phase == Phase.WORK) workMs else breakMs

  fun timeLeft(now: Long): Long = pausedLeft ?: maxOf(0L, endsAt - now)

  fun pause(now: Long, auto: Boolean = false): Session =
    if (paused) this else copy(pausedLeft = maxOf(0L, endsAt - now), autoPaused = auto)

  fun resume(now: Long): Session =
    if (pausedLeft == null) this else copy(endsAt = now + pausedLeft, pausedLeft = null, autoPaused = false)

  fun startBreak(at: Long): Session =
    copy(phase = Phase.BREAK, endsAt = at + breakMs, pausedLeft = null, autoPaused = false)

  /** Następny cykl pracy albo null, jeśli to był ostatni. */
  fun nextCycle(at: Long): Session? =
    if (isLastCycle) null
    else copy(phase = Phase.WORK, cycle = cycle + 1, endsAt = at + workMs, pausedLeft = null, autoPaused = false)

  fun toMap(): Map<String, Any?> = mapOf(
    "phase" to phase.id,
    "cycle" to cycle,
    "workMs" to workMs.toDouble(),
    "breakMs" to breakMs.toDouble(),
    "endsAt" to endsAt.toDouble(),
    "pausedLeft" to pausedLeft?.toDouble(),
    "startedAt" to startedAt.toDouble(),
    "maxCycles" to maxCycles,
    "stopAt" to stopAt?.toDouble(),
    "notifyOnEnd" to notifyOnEnd,
  )

  fun toJson(): JSONObject = JSONObject().apply {
    put("phase", phase.id)
    put("cycle", cycle)
    put("workMs", workMs)
    put("breakMs", breakMs)
    put("endsAt", endsAt)
    put("pausedLeft", pausedLeft ?: JSONObject.NULL)
    put("autoPaused", autoPaused)
    put("startedAt", startedAt)
    put("maxCycles", maxCycles ?: JSONObject.NULL)
    put("stopAt", stopAt ?: JSONObject.NULL)
    put("notifyOnEnd", notifyOnEnd)
  }

  companion object {
    fun fromJson(json: JSONObject) = Session(
      phase = if (json.getString("phase") == Phase.BREAK.id) Phase.BREAK else Phase.WORK,
      cycle = json.getInt("cycle"),
      workMs = json.getLong("workMs"),
      breakMs = json.getLong("breakMs"),
      endsAt = json.getLong("endsAt"),
      pausedLeft = json.longOrNull("pausedLeft"),
      autoPaused = json.optBoolean("autoPaused"),
      startedAt = json.getLong("startedAt"),
      maxCycles = json.longOrNull("maxCycles")?.toInt(),
      stopAt = json.longOrNull("stopAt"),
      notifyOnEnd = json.optBoolean("notifyOnEnd"),
    )
  }
}

/** Statystyki dnia (czas lokalny). */
data class Stats(val day: String = "", val breaks: Int = 0, val skipped: Int = 0) {
  fun bump(at: Long, skippedBreak: Boolean): Stats {
    val today = dayKey(at)
    val base = if (day == today) this else Stats(today)
    return if (skippedBreak) base.copy(skipped = base.skipped + 1) else base.copy(breaks = base.breaks + 1)
  }

  fun toMap(): Map<String, Any?> = mapOf("day" to day, "breaks" to breaks, "skipped" to skipped)

  fun toJson(): JSONObject = JSONObject().put("day", day).put("breaks", breaks).put("skipped", skipped)

  companion object {
    fun fromJson(json: JSONObject) = Stats(json.optString("day"), json.optInt("breaks"), json.optInt("skipped"))
  }
}

/** Ustawienia z aplikacji, których potrzebuje część natywna (także gdy JS nie działa). */
data class Config(
  val sound: Boolean = true,
  val vibration: Boolean = true,
  val breakStartSound: String? = null,
  val breakEndSound: String? = null,
  val fullScreenBreak: Boolean = true,
  val pauseOnScreenOff: Boolean = false,
) {
  fun toJson(): JSONObject = JSONObject().apply {
    put("sound", sound)
    put("vibration", vibration)
    put("breakStartSound", breakStartSound ?: JSONObject.NULL)
    put("breakEndSound", breakEndSound ?: JSONObject.NULL)
    put("fullScreenBreak", fullScreenBreak)
    put("pauseOnScreenOff", pauseOnScreenOff)
  }

  companion object {
    fun fromJson(json: JSONObject) = Config(
      sound = json.optBoolean("sound", true),
      vibration = json.optBoolean("vibration", true),
      breakStartSound = json.stringOrNull("breakStartSound"),
      breakEndSound = json.stringOrNull("breakEndSound"),
      fullScreenBreak = json.optBoolean("fullScreenBreak", true),
      pauseOnScreenOff = json.optBoolean("pauseOnScreenOff", false),
    )
  }
}

enum class EventType { BREAK_START, BREAK_END, END }

data class TimerEvent(val type: EventType, val at: Long)

fun dayKey(time: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(time))

private fun JSONObject.longOrNull(key: String): Long? = if (!has(key) || isNull(key)) null else getLong(key)

private fun JSONObject.stringOrNull(key: String): String? = if (!has(key) || isNull(key)) null else getString(key)
