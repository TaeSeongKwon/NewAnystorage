package util.myapp.comm;

import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

import util.myapp.resource.Resource;

/**
 * Created by TaeSeongKwon on 2017. 9. 30..
 */

public class DTP extends Thread{
    private Socket socket;
    private OutputStream out;
    private InputStream in;
    private boolean isDownload;
    private String filePath;
    private String key;
    private Long uploadSize;

    public DTP(String filePath, String key){
        this.filePath = filePath;
        this.key = key;
        this.isDownload = true;
        this.uploadSize = new Long((long)0);
    }

    public DTP(String filePath, String key, Long uploadSize){
        this.filePath = filePath;
        this.key = key;
        this.uploadSize = uploadSize;
        this.isDownload = false;
    }

    private boolean handShake(){
        try{
            socket = new Socket(Resource.IP, Resource.DTP_PORT);
            out = socket.getOutputStream();
            in = socket.getInputStream();

            JSONObject obj = new JSONObject();
            obj.put("type", Resource.REQ_DTP);
            obj.put("key", this.key);

            out.write(obj.toString().getBytes("UTF-8"));
            out.flush();
            Log.e("====>> "+Resource.REQ_DTP, " ");
            byte tmp[] = new byte[Resource.CHUNK_SIZE*4];
            int len = in.read(tmp);
            byte buff[] = new byte[len];
            System.arraycopy(tmp,0,buff,0,len);
            JSONObject resObj = new JSONObject(new String(buff, "UTF-8"));
            Log.e("====>> RECV DATA ", resObj.toString());

            if(resObj.getString("type").equals(Resource.RES_DTP)){
                if(resObj.getInt("code") == Resource.SUCCESS){
                    return true;
                }
            }
            return false;
        }catch(Exception e){
            Log.e("HAND SHAKE ERROR ", e.toString());
            return false;
        }
    }
    public void run(){
        if(handShake()) {
            if (isDownload) {
                Log.e("====>> DTP TYPE", "upload Mode");
                uploadData();
            } else {
                Log.e("====>> DTP TYPE", "download Mode");
                downloadData();
            }
        }
    }

    private void uploadData(){
        try {
            File file = new File(filePath);
            FileInputStream fileIn = new FileInputStream(file);

            BufferedOutputStream bOut = new BufferedOutputStream(out);
            DataOutputStream dOut = new DataOutputStream(bOut);

            int len;
            byte []tmp = new byte[Resource.EXTEND_CHUNK];

            while((len = fileIn.read(tmp))!= -1){
                byte []buff = new byte[len];
                System.arraycopy(tmp,0,buff,0,len);
                dOut.write(buff);
                dOut.flush();
            }

            dOut.close();
        }catch(Exception e){
            Log.e("====>> UPLOAD ERROR", e.toString());
        }

    }
    private void downloadData(){

        try{
            JSONObject obj = new JSONObject();
            obj.put("type", Resource.RDY_RECV);
            out.write(obj.toString().getBytes("UTF-8"));
            Log.e("====>> SEND RDY MSG", obj.toString());
            File file = new File(filePath);

            BufferedInputStream bIn = new BufferedInputStream(this.in);
            DataInputStream dIn = new DataInputStream(bIn);

            FileOutputStream fOut = new FileOutputStream(file);
            BufferedOutputStream bOut = new BufferedOutputStream(fOut);
            DataOutputStream dOut = new DataOutputStream(bOut);
            byte[] tmp = new byte[Resource.CHUNK_SIZE * Resource.CHUNK_SIZE];
            long sum = 0;
            while(true){
                int len = dIn.read(tmp);
                dOut.write(tmp,0,len);
                sum+= (long)len;
                Log.e("=====>> RECV BINARY DATA ", sum+" Byte");
                if(sum>=this.uploadSize) break;
            }

            dOut.close();
            dIn.close();
            Log.e("====>> DTP UPLOAD SUCCESS!", " ");
        }catch(Exception e){
            Log.e("====>> DTP COMMUNICATION ERROR ", e.toString());
        }
    }
}
