package expo.modules.zerknijtimer

import android.app.Activity
import android.content.Context
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/** Śledzi aktywność aplikacji: czy jest na wierzchu i czy może wyjść ponad ekran blokady. */
class ZerknijTimerPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> =
    listOf(
      object : ReactActivityLifecycleListener {
        override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
          activity ?: return
          Timer.init(activity)
          LockScreen.attach(activity)
        }

        override fun onResume(activity: Activity?) {
          activity ?: return
          Timer.appVisible = true
          LockScreen.attach(activity)
          Timer.restore(activity)
        }

        override fun onPause(activity: Activity?) {
          Timer.appVisible = false
        }
      },
    )
}
