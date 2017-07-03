package util.myapp.resource;

/**
 * Created by TaeSeongKwon on 2017. 7. 3..
 */

import android.os.Environment;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


public class FileInfo {
    public int cnt;
    public  String makeFileInfo() {
        File rootFile = Environment.getExternalStorageDirectory();
        JSONArray tree = getFileTree(rootFile);
        JSONObject obj = new JSONObject();

        JSONObject dataObj = new JSONObject();
        String fileInfo=null;
        try {
            dataObj.put("type", "file_tree");
            dataObj.put("data", tree);
            obj.put("type", "data");
            obj.put("data", dataObj);
            fileInfo = obj.toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return fileInfo;
    }
    private JSONArray getFileTree(File root){

        this.cnt = 0;
        JSONArray tree =  new JSONArray();
        JSONObject rootDir = new JSONObject();
        try {
            rootDir.put("id", "root_0");
            rootDir.put("value", "root");
            rootDir.put("open", true);
            rootDir.put("type", "forder");
            rootDir.put("date", root.lastModified()/1000);
            rootDir.put("data", createFileTree(root));
            tree.put(rootDir);
            //id: "files", value: "Files", open: true,  type: "folder", date:  new Date(2014,2,10,16,10), data
        } catch (Exception e) {
            e.printStackTrace();
        }
        return tree;
        //        return createFileTree(root);
    }



    private JSONArray createFileTree(File root){
        File[] childList = root.listFiles();
        String[] nameList = root.list();
        //        Log.e("CHECK : ", (nameList== null)+" ");
        JSONArray list = new JSONArray();
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd h:mm a");
        Calendar calendar = Calendar.getInstance();
        JSONArray data;
        JSONObject obj;
        File node;
        Long timelong, size;

        int lastPoint, nameLength;
        String executeType, type;
        for(int idx = 0; idx < childList.length; idx++){
            node = childList[idx];
            if (node.isHidden() || (node.getName().toLowerCase().equals("android") && node.isDirectory()) )
                continue;

            cnt++;
            try {
                calendar.setTime(new Date(node.lastModified()));

                data = new JSONArray();
                obj = new JSONObject();


                obj.put("id", "file_"+cnt);
                //                obj.put("id", node.getName());
                //                Log.e("id : ", ""+node.getAbsolutePath()+"/"+node.getName());
                obj.put("value", node.getName());
                obj.put("open", false);
                obj.put("date",node.lastModified()/1000);
                if(node.isDirectory()) {
                    type = "folder";
                    data = createFileTree(node);
                    obj.put("type", type);
                    if(data.length() > 0) {
                        obj.put("data", data);
                    }
                }
                else if (node.isFile()) {
                    lastPoint = node.getName().lastIndexOf(".");
                    nameLength = node.getName().length();
                    size = node.length();
                    obj.put("size", size);


                    if(lastPoint != -1){
                        executeType = node.getName().substring(lastPoint+1, nameLength);
                        executeType = executeType.toLowerCase();
                        //                        Log.e("executeType", executeType);
                        if(executeType.equals("doc") || executeType.equals("docx") || executeType.equals("docm")){
                            type = "Document";
                        }else if(executeType.equals("dot") || executeType.equals("dotx") || executeType.equals("dotm")){
                            type = "Document";
                        }else if(executeType.equals("ppt") || executeType.equals("pptx") || executeType.equals("pptm")){
                            type = "pp";
                        }else if(executeType.equals("pot") || executeType.equals("potx") || executeType.equals("potm")){
                            type = "pp";
                        }else if(executeType.equals("pps") || executeType.equals("ppsx") || executeType.equals("ppsm")){
                            type = "pp";
                        }else if(executeType.equals("xls") || executeType.equals("xlsx") || executeType.equals("xlsm")){
                            type = "excel";
                        }else if(executeType.equals("zip") || executeType.equals("tar") || executeType.equals("rar")){
                            type = "archive";
                        }else if(executeType.equals("jar") || executeType.equals("alz") || executeType.equals("xlsm")){
                            type = "archive";
                        }else if(executeType.equals("jpg") || executeType.equals("jpeg") || executeType.equals("gif")){
                            type = "image";
                        }else if(executeType.equals("png") || executeType.equals("psd") || executeType.equals("pdd")){
                            type = "image";
                        }else if(executeType.equals("tif") || executeType.equals("raw") || executeType.equals("svg")){
                            type = "image";
                        }else{
                            type = executeType;
                        }
                    }else {
                        type = "file";
                    }
                    obj.put("type", type);
                    //                id: "files", value: "Files", open: true,  type: "folder", date:  new Date(2014,2,10,16,10), data:
                }
                list.put(obj);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return list;
    }
}