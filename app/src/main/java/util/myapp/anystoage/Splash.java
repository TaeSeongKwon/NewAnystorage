package util.myapp.anystoage;

import android.content.SharedPreferences;
import android.os.Build;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import org.json.JSONObject;

import util.myapp.comm.Communication;
import util.myapp.myinterface.MyObserver;
import util.myapp.resource.Resource;

import android.content.Intent;
import android.util.*;
import android.provider.Settings;

public class Splash extends AppCompatActivity implements MyObserver{
    private Communication comm;
    private SharedPreferences preferences;

    @Override
    public void doRun(JSONObject obj) {
        try {
            String type = obj.getString("type");
            if(type.equals(Resource.RESPONSE_LOGIN)) {
                int code = obj.getInt("code");
                Intent intent;
                if(code == Resource.SUCCESS) intent = new Intent(Splash.this, MainActivity.class);
                else  intent = new Intent(Splash.this, LoginActivity.class);
                comm.removeObserver(this);
                startActivity(intent);
                this.finish();
            }
        }catch(Exception e){
            Log.e("====> Resonpse Data Error ", e.toString());
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        comm = Communication.getInstance();
        comm.start();

        comm.addObserver(this);

        preferences = this.getSharedPreferences("account", MODE_PRIVATE);
        new Thread(){
            public void run(){
                while(comm.isStart);
                String userId = preferences.getString("user_id", "");
                String userPwd = preferences.getString("user_pwd", "");
                if(userId.isEmpty() && userPwd.isEmpty()){
                    Intent intent = new Intent(Splash.this, LoginActivity.class);
                    comm.removeObserver(Splash.this);
                    startActivity(intent);
                    Splash.this.finish();
                }else{
                    // Send Login Message
                    try {
                        JSONObject obj = new JSONObject();
                        obj.put("type", Resource.REQUEST_LOGIN);
                        obj.put("user_id", userId);
                        obj.put("user_pwd", userPwd);
                        String m_androidId = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);

                        obj.put("device_name", m_androidId);
                        obj.put("device_serial", Build.SERIAL);
                        obj.put("device_model", Build.MODEL);

                        comm.sendData(obj.toString());
                    }catch(Exception e){
                        Log.e("====> Auto Login Error ", e.toString());
                    }
                }
            }
        }.start();
    }
}
