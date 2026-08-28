function isAuthenticated():boolean{
    return true
}

export default defineNuxtRouteMiddleware((to,from)=>{
    if(!isAuthenticated()){
        return navigateTo('/login')
    }
});