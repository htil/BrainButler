package com.brainbutler;

import com.facebook.react.ReactActivity;

//Set the module's activity here
import com.reactlibrary.RNLibMuseModule;

public class MainActivity extends ReactActivity {

    public MainActivity()
    {
      super();
      RNLibMuseModule.mainActivity = this;
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
