package com.example.dl579.login;


import java.net.Socket;

/**
 * Created by dl579 on 2017-07-01.
 */

class MySocket {
    static  Socket socket = null;
   static  String IP = "192.168.43.153";
    private static final MySocket ourInstance = new MySocket();

    static MySocket getInstance() {
        try {
            socket = new Socket(IP, 7723);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return ourInstance;
    }

    private MySocket() {

    }


}
