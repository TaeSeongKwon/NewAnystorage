package util.myapp.anystoage;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.annotation.RequiresPermission;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import java.text.*;
import java.util.*;
import org.json.*;
import android.os.*;
import util.myapp.comm.Communication;
import util.myapp.comm.DTP;
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

            }else if(type.equals(Resource.TYPE_MK_DIR)){
                String createPath = obj.getString("data");
                final JSONObject resData = mkdir(createPath);
                if(resData != null){
                    new Thread(){
                        public void run(){
                            comm.sendData(resData.toString());
                        }
                    }.start();
                }else{
                    final JSONObject failData = new JSONObject();
                    obj = new JSONObject();

                    JSONObject innerData = new JSONObject();
                    innerData.put("type", "response");
                    innerData.put("to", Resource.TYPE_MK_DIR);
                    innerData.put("code", Resource.FAIL);
                    failData.put("type", Resource.DATA);

                    failData.put("data", innerData);
                    new Thread(){
                        public void run(){
                            comm.sendData(failData.toString());
                        }
                    }.start();
                }
            }else if(type.equals(Resource.TYPE_RENAME)){
                JSONObject renameObj = obj.getJSONObject("data");
                rename(renameObj);
            } else if (type.equals(Resource.TYPE_REMOVE)) {
                JSONArray arr = obj.getJSONArray("data");
                String[] removeList = new String[arr.length()];

                for(int idx = 0; idx<removeList.length; idx++)
                    removeList[idx] = arr.getString(idx);

                rm(removeList);
            }else if(type.equals(Resource.TYPE_COPY)){
                JSONObject data = obj.getJSONObject("data");
                copy(data);
            }else if(type.equals(Resource.TYPE_MOVE)){
                JSONObject data = obj.getJSONObject("data");
                move(data);
            }else if(type.equals(Resource.TYPE_GET)){
                String filePath = obj.getString("data");
                String key = obj.getString("key");
                this.getFile(filePath, key);
            } else if (type.equals(Resource.TYPE_PUT)) {
                this.receiveFile(obj);
            }

        }catch(Exception e){
            Log.e("====> Recve Main Activity Error", e.toString());
        }
    }
    private JSONObject mkdir(String path){
        try {
            String abPath = Environment.getExternalStorageDirectory().getCanonicalPath();
            String folderPath = abPath.concat(path);
            SimpleDateFormat format = new SimpleDateFormat("kkmmss");
            folderPath = folderPath.concat("새폴더_").concat(format.format(new Date()));

            File manage = new File(folderPath);
            JSONObject resObj = new JSONObject();
            JSONObject innerData = new JSONObject();
            resObj.put("type", Resource.DATA);
            innerData.put("type", Resource.RESPONSE);
            innerData.put("to", Resource.TYPE_MK_DIR);

            if (manage.mkdir()) {
                innerData.put("code", Resource.SUCCESS);
            } else {
                innerData.put("code", Resource.FAIL);
            }
            resObj.put("data", innerData);
            return resObj;
        }catch(Exception e){
            Log.e("=====> MK_DIR Error ", e.toString());
            return null;
        }
    }

    private void getFile(String filePath, String key){
        try {
            String abPath = Environment.getExternalStorageDirectory().getCanonicalPath();
            filePath = abPath+filePath;
            DTP dtp = new DTP(filePath, key);
            dtp.start();
        }catch(Exception e){

        }
    }
    private void receiveFile(JSONObject obj){
        try {
            String filePath = obj.getString("path");
            String fileName = obj.getString("name");
            String key = obj.getString("key");
            Long size = obj.getLong("size");
            String abPath = Environment.getExternalStorageDirectory().getCanonicalPath();
            filePath = abPath + filePath + fileName;

            DTP dtp = new DTP(filePath, key, size);
            dtp.start();
        }catch(Exception e){

        }
    }
    private void rm(String[] list){
        try {
            String[] removeList = new String[list.length];
            boolean flag = true;
            int totalCnt = removeList.length;
            int successCnt = 0;
            for (int i = 0; i < removeList.length; i++) {
                removeList[i] = Environment.getExternalStorageDirectory().getCanonicalPath().concat(list[i]);
                Log.e("======> Remove Path ", removeList[i]);
                File root = new File(removeList[i]);
                flag = deleteFile(root);
                successCnt += (flag == true) ? 1 : 0;
            }
            final JSONObject obj = new JSONObject();
            JSONObject innerData = new JSONObject();
            obj.put("type", Resource.DATA);
            innerData.put("type", Resource.RESPONSE);
            innerData.put("to", Resource.TYPE_REMOVE);
            if(successCnt == totalCnt){
                innerData.put("code", Resource.SUCCESS);
            }else{
                innerData.put("code", Resource.FAIL);
                innerData.put("totalCnt", totalCnt);
                innerData.put("successCnt", successCnt);
            }
            obj.put("data", innerData);

            new Thread(){
                public void run(){
                    comm.sendData(obj.toString());
                }
            }.start();
        }catch(Exception e){
            Log.e("====> REMOVE File Error ", e.toString());
        }
    }

    private boolean deleteFile(File root){
        File fileList[];
        boolean flag = true;
        if(root.isDirectory()) {
            fileList = root.listFiles();
            if (fileList.length > 0) {
                for (int i = 0; i < fileList.length; i++) {
                    flag = deleteFile(fileList[i]);
                    if (!flag) break;
                }
            }
        }
        if(flag) flag = root.delete();

        return flag;
    }

    private void rename(JSONObject renameData){
        try{
            String src = renameData.getString("originName");
            String dest = renameData.getString("newName");
            String rootPath = Environment.getExternalStorageDirectory().getCanonicalPath();
            src = rootPath.concat(src);
            dest = rootPath.concat(dest);

            File srcFile = new File(src);
            File destFile = new File(dest);
            final JSONObject obj = new JSONObject();
            JSONObject innerData = new JSONObject();
            obj.put("type", Resource.DATA);
            innerData.put("type", Resource.RESPONSE);
            innerData.put("to", Resource.TYPE_RENAME);

            if(srcFile.renameTo(destFile)){
                innerData.put("code", Resource.SUCCESS);
            }else{
                innerData.put("code", Resource.FAIL);
            }

            obj.put("data", innerData);

            new Thread(){
                public void run(){
                    comm.sendData(obj.toString());
                }
            }.start();
        }catch(Exception e){
            Log.e("====> RENAME Error ", e.toString());
        }
    }
    private void copy(JSONObject obj){
        try {
            JSONArray srcList = obj.getJSONArray("srcFiles");
            JSONArray destList = obj.getJSONArray("destFiles");

            String[] srcPathList = getPathList(srcList);
            String[] destPathList = getPathList(destList);

            File srcFile, destFile;

            final JSONObject resData =new JSONObject();
            JSONObject innerData = new JSONObject();
            resData.put("type", Resource.DATA);
            innerData.put("type", Resource.RESPONSE);
            innerData.put("to", Resource.TYPE_COPY);

            if (srcPathList != null && destPathList != null) {

                int totalCnt = srcPathList.length;
                int successCnt = 0;

                for(int idx = 0; idx< srcPathList.length; idx++){
                    Log.e("Copy src Path ", srcPathList[idx]);
                    Log.e("Copy src Path ", destPathList[idx]);
                    srcFile = new File(srcPathList[idx]);
                    destFile = new File(destPathList[idx]);
                    long i = 1;
                    // File Name Check
                    while(destFile.exists()){
                        // is Directory
                        if(destFile.isDirectory()){
                            destFile = new File(destPathList[idx]+"("+i+")");
                            Log.e("path : ", destFile.getCanonicalPath());
                        }else if(destFile.isFile()){
                            String extType, name, base;

                            int lastDirPoint = destPathList[idx].lastIndexOf("/");

                            base = destFile.getCanonicalPath();
                            base = base.substring(0, base.lastIndexOf("/"));
                            name = destFile.getName();

                            int point = name.lastIndexOf(".");

                            if(point > 0){
                                extType = name.substring(point, name.length());
                                name = name.substring(0, point);
                                destFile = new File(base+"/"+name+"("+i+")"+extType);
                            }else{
                                destFile = new File(base+"/"+name+"("+i+")");
                            }

                        }
                        i++;
                    }
                    flag =  copyFile(srcFile, destFile);
                    successCnt += (flag == true) ? 1 : 0;
                }
                if(totalCnt == successCnt){
                    innerData.put("code", Resource.SUCCESS);
                }else{
                    innerData.put("code", 404);
                    innerData.put("totalCnt", totalCnt);
                    innerData.put("successCnt", successCnt);
                }
            }else{
                innerData.put("code", Resource.FAIL);
            }
            resData.put("data", innerData);
            new Thread(){
                public void run(){
                    comm.sendData(resData.toString());
                }
            }.start();
        }catch(Exception e){
            Log.e("====> COPY ERROR ", e.toString());
        }

    }
    private void move(JSONObject obj){
        try {
            JSONArray srcList = obj.getJSONArray("srcFiles");
            JSONArray destList = obj.getJSONArray("destFiles");

            String[] srcPathList = getPathList(srcList);
            String[] destPathList = getPathList(destList);

            final JSONObject resData =new JSONObject();
            JSONObject innerData = new JSONObject();
            resData.put("type", Resource.DATA);
            innerData.put("type", Resource.RESPONSE);
            innerData.put("to", Resource.TYPE_MOVE);

            if (srcPathList != null && destPathList != null) {
                int totalCnt = srcPathList.length;
                int successCnt = 0;
                for(int i = 0; i<srcPathList.length; i++) {
                    File originFile = new File(srcPathList[i]);
                    File newFile = new File(destPathList[i]);
                    if (originFile.renameTo(newFile))
                        successCnt++;
                }

                if(totalCnt == successCnt){
                    innerData.put("code", Resource.SUCCESS);
                }else{
                    innerData.put("code", 404);
                    innerData.put("totalCnt", totalCnt);
                    innerData.put("successCnt", successCnt);
                }
            }else{
                innerData.put("code", Resource.FAIL);
            }
            resData.put("data", innerData);
            new Thread(){
                public void run(){
                    comm.sendData(resData.toString());
                }
            }.start();
        }catch(Exception e){
            Log.e("====> MOVE ERROR ", e.toString());
        }
    }

    private boolean copyFile(File sourceFile, File newFile){
        FileInputStream in;
        FileOutputStream out;
        File childFile;
        File []list;
        byte []data;
        int len;
        boolean flag = true;
        try {
            if (sourceFile.isFile()) {
                in = new FileInputStream(sourceFile);
                out = new FileOutputStream(newFile);

                data = new byte[in.available()];
                while((len = in.read(data)) != -1){
                    out.write(data,0,len);
                }
                in.close();
                out.close();
                flag = true;
            }else if(sourceFile.isDirectory()){
                if(newFile.mkdir()) {
                    list = sourceFile.listFiles();
                    for(int i = 0; i<list.length && flag; i++){
                        childFile = new File(newFile.getCanonicalPath()+"/"+list[i].getName());
                        flag = copyFile(list[i], childFile);
                    }
                }else flag = false;
            }
        }catch(Exception e){
            Log.e("copy recusion error", e.toString());
            flag = false;
        }
        return flag;
    }

    private String[] getPathList(JSONArray list){
        try {
            String[] pathList = new String[list.length()];
            String basePath = Environment.getExternalStorageDirectory().getCanonicalPath();
            for(int idx = 0; idx<pathList.length; idx++)
                pathList[idx] = basePath.concat(list.getString(idx));

            return pathList;
        }catch(Exception e){
            Log.e("======> Get Path List Error ", e.toString());
            return null;
        }
    }

    private void send(String msg){
        final String data = msg;
        new Thread(){
            public void run(){
                comm.sendData(data);
            }
        }.start();
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
