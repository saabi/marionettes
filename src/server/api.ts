import * as child_process from "child_process";
import * as Koa from "koa";
import * as https from 'https';
import * as URL from 'url';

export module API {
    function asyncExec ( command: string, options: child_process.ExecOptions ) {
        return new Promise<{stderr:string, stdout:string}>((resolve, reject) => {
            return child_process.exec(command, options, (error, stdout, stderr) => {
                return error ? reject(error) : resolve({stdout, stderr});
            });
        });
    }

    function run ( ctx:Koa.Context, next:() => Promise<any>, cmd:string, args: string[], opts?:child_process.SpawnOptions ) {
        let child = child_process.spawn(cmd, args);
        let output = "";
        let errorOutput = "";
        child.stdout.on('data', (data) => {
            output += data;
        });
        child.stderr.on('data', (data) => {
            errorOutput += data;
        });
        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            ctx.response.body = errorOutput !== "" ? errorOutput : output;
        });
    }

    export async function updateFiles ( ctx:Koa.Context, next:() => Promise<any> ) {
        console.log(ctx.request.body);
        try {
            let result = await asyncExec("git pull origin master", {cwd: "../culturanomade.com/"});
            let response = {
                response_type: 'in_channel',
                text: 'Actualizacion del codigo culturanomade.com en el servidor',
                attachments: new Array()
            };
            if (result.stderr)
                response.attachments.push({
                    title: 'Errores',
                    color: 'danger',
                    text: result.stderr
                });
            if (result.stdout)
                response.attachments.push({
                    title: 'Resultado',
                    color: 'good',
                    text: result.stdout
                });
            ctx.response.body = response;
        } catch (error) {
            console.error(error);
            ctx.throw("Error on API.updateFiles.", 500)
        }
    }
    export async function buildSource ( ctx:Koa.Context, next:() => Promise<any> ) {
        console.log(ctx.request.body);
        try {
            let url = URL.parse(ctx.request.body.response_url);
            child_process.exec("./build", {cwd: "../culturanomade.com/"}, (err, stdout, stderr) => {
                let response = {
                    response_type: 'in_channel',
                    text: 'Compilacion de culturanomade.com',
                    attachments: new Array()
                };
                if (stderr)
                    response.attachments.push({
                        title: 'Errores',
                        color: 'danger',
                        text: stderr
                    });
                if (stdout)
                    response.attachments.push({
                        title: 'Resultado',
                        color: 'good',
                        text: stdout
                });
                let postData = JSON.stringify(response);
                let req = https.request({
                    protocol: url.protocol,
                    host: url.host,
                    path: url.path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                });
                req.write(postData);
                req.end();
            });
            let response = {
                response_type: 'in_channel',
                text: 'Compilando del codigo culturanomade.com en el servidor...',
            };
            ctx.response.body = response;
        } catch (error) {
            console.error(error);
            ctx.throw("Error on API.updateFiles.", 500)
        }
    }
    export async function restartServer ( ctx:Koa.Context, next:() => Promise<any> ) {
        console.log(ctx.request.body);
        try {
            let result = await asyncExec("pm2 restart culturanomade", {});
            let response = {
                response_type: 'in_channel',
                text: 'Reinicio de culturanomade.com',
                attachments: new Array()
            };
            if (result.stderr)
                response.attachments.push({
                    title: 'Errores',
                    color: 'danger',
                    text: result.stderr
                });
            if (result.stdout)
                response.attachments.push({
                    title: 'Resultado',
                    color: 'good',
                    text: result.stdout
                });
            ctx.response.body = response;
        } catch (error) {
            console.error(error);
            ctx.throw("Error on API.restartServer.", 500)
        }
    }
}
