import * as SecureStore from 'expo-secure-store';

async function save_ip(ip) {
    await SecureStore.setItemAsync('ip', ip);
}

async function save_port(port) {
    await SecureStore.setItemAsync('port', port);
}


async function delete_ip(){
    await SecureStore.deleteItemAsync('ip');
}
async function delete_port(){
    await SecureStore.deleteItemAsync('port');
}

export const verify = (popup_set_state, ip, port) => {

    new Promise(
        async (resolve)=>{

            let ip_db = await SecureStore.getItemAsync('ip');
            let port_db = await SecureStore.getItemAsync('port');

            if(ip ===''){
                if(ip_db){
                    ip = ip_db;
                }else{
                    ip = 'localhost';
                }
            }
            if(port ===''){
                if(port_db){
                    port = port_db;
                }else{
                    port = '3000';
                }
            }

            fetch('http://'+ip+':'+port+'/welcome')
            .then(
                (res)=>{
                    popup_set_state(false);
                    delete_ip();
                    delete_port();
                    save_ip(ip);
                    save_port(port);
                    resolve();
                }
            ).catch(
                (err)=>{
                    delete_ip();
                    delete_port();
                    popup_set_state(true);
                    resolve();
                }
            )

        }
    )
}

export const get_hostname = async () => {

    let ip_db = await SecureStore.getItemAsync('ip');
    let port_db = await SecureStore.getItemAsync('port');

    return ip_db+':'+ port_db;
}

export const restart = ()=>{
    delete_ip();
    delete_port();
}