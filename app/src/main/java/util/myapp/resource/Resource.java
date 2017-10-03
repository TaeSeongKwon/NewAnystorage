package util.myapp.resource;

/**
 * Created by TaeSeongKwon on 2017. 7. 3..
 */

public class Resource {
    public final static String IP = "project-knock.tk";
    public final static int PORT = 9900;
    public final static int DTP_PORT = 2011;

    public final static int CHUNK_SIZE = 1024;
    public final static int EXTEND_CHUNK = 1024 * 48;
    public final static int SUCCESS = 200;
    public final static int FAIL = 200;

    public final static String RESPONSE = "response";

    public final static String REQUEST_LOGIN = "login";
    public final static String RESPONSE_LOGIN = "response:login";

    public final static String REQUEST_LOGOUT = "logout";
    public final static String RESPONSE_LOGOUT = "response:logout";

    public final static String DATA = "data";
    public final static String TYPE_FILE_TREE = "file_tree";

    public final static String REQ_DTP = "request:new_dtp";
    public final static String RES_DTP = "response:new_dtp";
    public final static String RDY_RECV = "ready:file_recv";

    public final static String TYPE_MK_DIR = "mkdir";
    public final static String TYPE_RENAME = "rename";
    public final static String TYPE_REMOVE = "rm";
    public final static String TYPE_COPY = "cp";
    public final static String TYPE_MOVE = "mv";
    public final static String TYPE_GET = "get";
    public final static String TYPE_PUT = "put";
}
