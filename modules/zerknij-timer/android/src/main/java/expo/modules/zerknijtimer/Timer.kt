package expo.modules.zerknijtimer

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject
import java.util.concurrent.CopyOnWriteArraySet
import kotlin.math.roundToLong

/**
 * Jedyne źródło prawdy o sesji. Stan trzymamy w SharedPreferences, więc przeżywa
 * zamknięcie aplikacji – alarm, usługa i akcje z powiadomień korzystają z tego samego obiektu.
 */
object Timer {
  private var prefs: SharedPreferences? = null

  var session: Session? = null
    private set
  var stats = Stats()
    private set
  var config = Config()
    private set

  /** Czy ekran aplikacji jest teraz na wierzchu (wtedy nie pokazujemy wyskakującego powiadomienia). */
  @Volatile
  var appVisible = false

  val listeners = CopyOnWriteArraySet<() -> Unit>()

  @Synchronized
  fun init(context: Context) {
    if (prefs != null) return
    val p = context.applicationContext.getSharedPreferences("zerknij_timer", Context.MODE_PRIVATE)
    prefs = p
    session = p.read("session", Session::fromJson)
    stats = p.read("stats", Stats::fromJson) ?: Stats()
    config = p.read("config", Config::fromJson) ?: Config()
  }

  /** Czas zaokrąglony do pełnej sekundy – odliczanie zmienia się równo z zegarem. */
  private fun now() = (System.currentTimeMillis() / 1000.0).roundToLong() * 1000

  @Synchronized
  fun start(context: Context, workMs: Long, breakMs: Long, maxCycles: Int?, stopAt: Long?, notifyOnEnd: Boolean) {
    val now = now()
    commit(
      context,
      Session(Phase.WORK, 1, workMs, breakMs, now + workMs, workMs, null, false, now, maxCycles, stopAt, notifyOnEnd),
    )
  }

  @Synchronized
  fun togglePause(context: Context) {
    val s = session ?: return
    commit(context, if (s.paused) s.resume(now()) else s.pause(now()))
  }

  /** „Przerwa teraz” – kończy pracę przed czasem. */
  @Synchronized
  fun breakNow(context: Context) {
    val s = session?.takeIf { it.phase == Phase.WORK } ?: return
    commit(context, s.startBreak(now()))
  }

  /** „Pomiń przerwę” – od razu następny cykl (albo koniec, jeśli to był ostatni). */
  @Synchronized
  fun skipBreak(context: Context) {
    val s = session?.takeIf { it.phase == Phase.BREAK } ?: return
    val now = now()
    stats = stats.bump(now, skippedBreak = true)
    commit(context, s.nextCycle(now))
  }

  /** „Za 5 min” – odkłada bieżącą przerwę. */
  @Synchronized
  fun snoozeBreak(context: Context) {
    val s = session?.takeIf { it.phase == Phase.BREAK } ?: return
    commit(context, s.snooze(now()))
  }

  @Synchronized
  fun stop(context: Context) {
    if (session != null) commit(context, null)
  }

  @Synchronized
  fun onScreenOff(context: Context) {
    val s = session ?: return
    if (config.pauseOnScreenOff && !s.paused) commit(context, s.pause(now(), auto = true))
  }

  @Synchronized
  fun onUnlock(context: Context) {
    val s = session ?: return
    if (s.autoPaused) commit(context, s.resume(now()))
  }

  @Synchronized
  fun setConfig(context: Context, next: Config) {
    config = next
    save()
    LockScreen.update()
    // Wyłączenie „pauzy przy wyłączonym ekranie” zdejmuje pauzę, którą sama założyła.
    val s = session
    if (!next.pauseOnScreenOff && s != null && s.autoPaused) commit(context, s.resume(now()))
  }

  /**
   * Przesuwa sesję o wszystkie fazy, które minęły do `now`. Wołane przez alarm, usługę (co sekundę
   * przy włączonym ekranie) i ekran aplikacji – wielokrotne wywołanie niczego nie psuje.
   */
  @Synchronized
  fun sync(context: Context, now: Long = System.currentTimeMillis()) {
    var current: Session? = session ?: return
    var nextStats = stats
    val events = mutableListOf<TimerEvent>()

    while (current != null) {
      val s: Session = current
      val stopAt = s.stopAt
      if (stopAt != null && now >= stopAt && (s.paused || stopAt <= s.endsAt)) {
        events += TimerEvent(EventType.END, stopAt)
        current = null
      } else if (!s.paused && now >= s.endsAt) {
        if (s.phase == Phase.WORK) {
          events += TimerEvent(EventType.BREAK_START, s.endsAt)
          current = s.startBreak(s.endsAt)
        } else {
          nextStats = nextStats.bump(s.endsAt, skippedBreak = false)
          current = s.nextCycle(s.endsAt)
          events += TimerEvent(if (current != null) EventType.BREAK_END else EventType.END, s.endsAt)
        }
      } else {
        break
      }
    }

    if (events.isEmpty()) return
    stats = nextStats
    commit(context, current, events)
  }

  /**
   * Po ubiciu procesu (np. aktualizacja aplikacji) sesja zostaje w pamięci trwałej, ale usługa
   * i alarm znikają. Wołane przy otwarciu aplikacji – przywraca je, jeśli sesja trwa.
   */
  @Synchronized
  fun restore(context: Context) {
    sync(context)
    val s = session ?: return
    Alarms.schedule(context.applicationContext, s)
    TimerService.ensureRunning(context.applicationContext)
  }

  fun snapshot(): Map<String, Any?> = mapOf("session" to session?.toMap(), "stats" to stats.toMap())

  private fun commit(context: Context, next: Session?, events: List<TimerEvent> = emptyList()) {
    val previous = session
    session = next
    save()
    Effects.apply(context.applicationContext, previous, next, events)
    listeners.forEach { it() }
  }

  private fun save() {
    prefs?.edit()
      ?.putString("session", session?.toJson()?.toString())
      ?.putString("stats", stats.toJson().toString())
      ?.putString("config", config.toJson().toString())
      ?.apply()
  }

  private fun <T> SharedPreferences.read(key: String, parse: (JSONObject) -> T): T? =
    getString(key, null)?.let { runCatching { parse(JSONObject(it)) }.getOrNull() }
}
