package com.example.dl579.login;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Button PrevButton = (Button) findViewById(R.id.Prev_Button);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }


}
