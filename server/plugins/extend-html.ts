export default defineNitroPlugin((nitroApp)=>{
    nitroApp.hooks.hook('render:html',(html,{event})=>{
        console.log(html)
        html.head.push(`<meta name="description" content="My custom description"/>`)
    })
    nitroApp.hooks.hook('render:response',(res,{event})=>{
        console.log(res)
    })
})