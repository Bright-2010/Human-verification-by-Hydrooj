import {  
    Context, Handler, Schema, SystemModel, ValidationError,  
    definePlugin, superagent,  
} from 'hydrooj';  
  
export default definePlugin({  
    name: 'cloudflare-turnstile',  
    schema: Schema.object({  
        siteKey: Schema.string().description('Cloudflare Turnstile Site Key').required(),  
        secretKey: Schema.string().description('Cloudflare Turnstile Secret Key').role('secret').required(),  
        endpoint: Schema.string().description('Turnstile Verify Endpoint').default('https://challenges.cloudflare.com/turnstile/v0/siteverify'),  
    }),  
    async apply(ctx: Context, config) {  
        // 注入 Turnstile 脚本到注册页面  
        ctx.on('handler/create', (h) => {  
            if (h.constructor.name === 'UserRegisterHandler') {  
                h.UiContext.turnstileSiteKey = config.siteKey;  
            }  
        });  
  
        // 拦截注册 POST 请求进行验证  
        ctx.on('handler/before/user/register#post', async (h: Handler) => {  
            const turnstileToken = h.request.body['cf-turnstile-response'];  
              
            if (!turnstileToken) {  
                throw new ValidationError('captcha', null, 'Please complete the CAPTCHA verification');  
            }  
  
            // 验证 Turnstile token  
            try {  
                const response = await superagent.post(config.endpoint)  
                    .send({  
                        secret: config.secretKey,  
                        response: turnstileToken,  
                        remoteip: h.request.ip,  
                    })  
                    .set('Content-Type', 'application/json');  
  
                if (!response.body.success) {  
                    const errorCodes = response.body['error-codes'] || [];  
                    throw new ValidationError('captcha', null, `CAPTCHA verification failed: ${errorCodes.join(', ')}`);  
                }  
            } catch (err) {  
                if (err instanceof ValidationError) throw err;  
                throw new ValidationError('captcha', null, 'CAPTCHA verification error');  
            }  
        });  
  
        // 添加多语言支持  
        ctx.i18n.load('zh', {  
            'Please complete the CAPTCHA verification': '请完成人机验证',  
            'CAPTCHA verification failed': '人机验证失败',  
            'CAPTCHA verification error': '人机验证出错',  
        });  
    },  
});