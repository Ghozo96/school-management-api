module.exports = ({ managers }) =>{
    return ({req, res, next})=>{
        const decodedToken = managers.token.verifyLongToken({token: req.headers.token});
        const [ moduleName, fnName ] = req.url.split('/').slice(2)
        const userRole = decodedToken.userRole;
        const allowedRoles = managers[moduleName].allowedRoles
        if (Array.isArray(allowedRoles)) {
            if(!allowedRoles.includes(userRole)) {
                return managers.responseDispatcher.dispatch(res, {ok: false, code: 403, message: 'Forbidden'});
            }
        } else {
            if(!allowedRoles[fnName].includes(userRole)) {
                return managers.responseDispatcher.dispatch(res, {ok: false, code: 403, message: 'Forbidden'});
            }
        }
        next();
    }
}