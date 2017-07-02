package com.example.dl579.login;

import android.os.Build;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends AppCompatActivity {
    MySocket mySocket ;
    Send receive;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final Thread Connect = new Thread() {
            public void run() {
                try {

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        };
        Connect.start();
    }
}
