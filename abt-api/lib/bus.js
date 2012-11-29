/**
 * A class that can be used for convenience when nested async calls are involved.
 * It behaves as an event bus.
 */
var Bus = function(req, res){
    this.req = req;
    this.res = res;

    /**
     * Subscribes a method on a token
     */
    this.on = function(token, listener){
        this[token] = listener;
    };

    /**
     * Calls the method subscribed for the token and passes data as a parameter
     */
    this.fire = function(token, data){
        //TODO (3) add this check here - check whether a method has been registered on this token
        if (this[token])
            this[token](data);
    };
};

module.exports = Bus;