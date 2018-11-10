package com.brainbutler;

import com.facebook.react.ReactActivity;

//Set the module's activity here
import com.reactlibrary.RNLibMuseModule;

//For configuring react-native-orientation
import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends ReactActivity {

    public MainActivity()
    {
      super();
      RNLibMuseModule.mainActivity = this;
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig)
    {
      super.onConfigurationChanged(newConfig);
      Intent intent = new Intent("onConfigurationChanged");
      intent.putExtra("newConfig", newConfig);
      this.sendBroadcast(intent);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "BrainButler";
    }
}
