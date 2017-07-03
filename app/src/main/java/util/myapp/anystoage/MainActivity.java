package util.myapp.anystoage;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.annotation.RequiresPermission;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import org.json.JSONObject;

import util.myapp.comm.Communication;
import util.myapp.myinterface.MyObserver;
import util.myapp.resource.FileInfo;
import util.myapp.resource.Resource;
import android.util.Log;
import java.io.*;

public class MainActivity extends AppCompatActivity implements MyObserver{
    private FileInfo fileInfo = null;
    Communication comm = null;
    private boolean flag = true;
    @Override
    public void doRun(JSONObject obj) {
        if(fileInfo == null) fileInfo = new FileInfo();
        if(comm == null) comm = Communication.getInstance();
        Log.e("====> MAIN ACTIVITY ", obj.toString());
        try {
            String type = obj.getString("type");

            if (type.equals(Resource.TYPE_FILE_TREE)) {

                final String data = fileInfo.makeFileInfo();
                new Thread(){
                    public void run(){
                         comm.sendData(data);
                    }
                }.start();

            }
        }catch(Exception e){
            Log.e("====> Recve Main Activity Error", e.toString());
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            if(this.checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED){
                String str[] = new String[]{ Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE};
                this.requestPermissions( str, 500);
            }
        }
        if(comm == null) {
            comm = Communication.getInstance();
            comm.addObserver(this);
        }

    }
}
