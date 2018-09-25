package com.brainbutler;

import com.facebook.react.ReactActivity;

import v.LibMuse.LibMuseModule;

public class MainActivity extends ReactActivity {

    public MainActivity()
    {
	    super();
	    LibMuseModule.mainActivity = this;
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
