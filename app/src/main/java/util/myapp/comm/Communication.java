package util.myapp.comm;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.LinkedList;
import java.io.*;
import java.net.*;
import android.util.Log;
import util.myapp.myinterface.MyObserver;
import util.myapp.resource.Resource;



/**
 * Created by TaeSeongKwon on 2017. 7. 3..
 */
public class Communication extends Thread{
    private Socket socket;
    private InputStream in;
    private OutputStream out;
    private BufferedOutputStream bOut;
    private DataOutputStream dOut;
    private LinkedList<MyObserver> observerList;
    public boolean isStart = true;
    private static Communication ourInstance = null;

    public synchronized static Communication getInstance() {
        if(ourInstance == null) {
            ourInstance = new Communication();
        }
        return ourInstance;
    }

    private Communication() {
        observerList = new LinkedList<>();
    }

    private void init(){
        try{
            socket = new Socket(Resource.IP, Resource.PORT);
            in = socket.getInputStream();
            out = socket.getOutputStream();
            bOut = new BufferedOutputStream(out);
            dOut = new DataOutputStream(bOut);

            isStart = false;
            socket.setSendBufferSize(1024*1024);
            socket.setTcpNoDelay(true);
        }catch(Exception e){
            Log.e("==> Connect Error ", e.toString());
        }
    }

    public void sendData(String msg){
        try{
//          new Version
            msg += "\n\r";
            out.write(msg.getBytes("UTF-8"));
//            dOut.write(msg.getBytes("UTF-8"));
//          Current Version
//            byte[] buff = msg.getBytes("UTF-8");
//            byte[] tmp, chunk;
//            int len = buff.length, cnt = 0;
//            tmp = new byte[Resource.CHUNK_SIZE];
//
//            for(int idx = 0; idx<len; idx++){
//                if(cnt == Resource.CHUNK_SIZE){
//                    cnt = 0;
//                    chunk = tmp;
//                    out.write(chunk);
//                }
//                tmp[cnt++] = buff[idx];
//
//            }
//            if(cnt != 0){
//                chunk = new byte[cnt];
//                System.arraycopy(tmp, 0,chunk,0,cnt);
//                out.write(chunk);
//            }


            // Old Version
//            JSONObject obj = new JSONObject();
//            obj.put("type","dataSize");
//            obj.put("size", len);
//
//            out.write(obj.toString().getBytes());
//
//            int cnt = 0;
//            int chunkIdx = 0;
//            byte[] tmp = new byte[Resource.CHUNK_SIZE];
//            byte[] chunk;
//            for(int i = 0; i<len; i++){
//                if(cnt == Resource.CHUNK_SIZE){
//                    cnt = 0;
//                    obj =new JSONObject();
//                    obj.put("type", "chunk");
//                    obj.put("seq", chunkIdx++);
//                    JSONArray arr = new JSONArray(tmp);
//                    obj.put("data", arr);
//                    out.write(obj.toString().getBytes("UTF-8"));
//                }
//                tmp[cnt++] = buff[i];
//            }
//            if(cnt != 0){
//                chunk = new byte[cnt];
//                System.arraycopy(tmp, 0, chunk,0,cnt);
//                obj =new JSONObject();
//                obj.put("type", "chunk");
//                obj.put("seq", chunkIdx++);
//                JSONArray arr = new JSONArray(chunk);
//                obj.put("data", arr);
//                out.write(obj.toString().getBytes("UTF-8"));
//            }
//            out.write(msg.getBytes("UTF-8"));
        }catch(Exception e){
            Log.e("===> Send Data Exception", e.toString());
        }
    }

    public OutputStream getOutputStream(){
        return out;
    }
    public void addObserver(MyObserver obj){
        observerList.add(obj);
    }
    public void removeObserver(MyObserver obj){
        observerList.remove(obj);
    }
    private byte[] receiveData(){
        byte[] buff, data;
        int len;
        try{
            buff = new byte[Resource.CHUNK_SIZE];
            len = in.read(buff);
            data = new byte[len];
            System.arraycopy(buff, 0, data, 0, len);
            Log.e("Receive ", buff.toString());
            return data;
        }catch(Exception e){
            Log.e("===> Receive Error ", e.toString());
            return null;
        }
    }
    public void run(){
        String data;
        byte[] buff = null;
        JSONObject obj;
        init();

        while(true){
            try {
                if(buff == null){
                    Log.e("Buffer is Null", " ");
                    buff = this.receiveData();
                }else{
                    Log.e("Buffer append", " ");
                    byte[] tmp = this.receiveData();
                    byte[] copy = new byte[buff.length + tmp.length];
                    System.arraycopy(buff,0,copy, 0,buff.length);
                    System.arraycopy(tmp,0,copy,buff.length, tmp.length);
                    buff = copy;
                }
                data = new String(buff, "UTF-8");
                if (data != null) {
                    obj = new JSONObject(data);
                    Log.e("Receive Data ", obj.toString());
                    for (int idx = 0, len = observerList.size(); idx < len; idx++) {
                        observerList.get(idx).doRun(obj);
                    }
                    buff = null;
                }
            }catch(Exception e){
                Log.e("===> Communication Error ", e.toString());
            }
        }
    }
}
