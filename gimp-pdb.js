module.exports = function(RED) {
    RED.Swagger = require("swagger-client");

    var ARG_DEFAULT_NULL = ["image", "layer", "drawable", "item", "display"]
    registration = async function () {
        promise = RED.Swagger('http://localhost:8920/api/v1/pdb/')
        .then( client => {
        Object.keys(client.apis.default).forEach(function(it){
            var operation = client.apis.default[it]
            var def_func = function(config) {
                RED.nodes.createNode(this, config);
                var node = this;
                node.arguments = {}
                var arg_keys = Object.keys(config)
                               .map(function(it) { return /^arg-(.*)/.exec(it) })
                               .filter(function(it){ return it != null });
                arg_keys.forEach(function(key) {
                    var conf_key = key[0];
                    var arg_key  = key[1];
                    if (ARG_DEFAULT_NULL.includes(arg_key)) {
                        if (typeof(config[conf_key]) == 'integer')
                            node.arguments[arg_key] = config[conf_key];
                        else
                            node.arguments[arg_key] = null;
                    } else
                        node.arguments[arg_key] = config[conf_key];
                });
                node.on('input', function(msg) {
                    console.log("node args="+Object.keys(node.arguments).map(function(it){return it+": "+ node.arguments[it]}).join(","))
                    var this_context = (typeof(msg.payload.context)=='object')? msg.payload.context : {}
                    operation({payload: {context: this_context, arguments: node.arguments }}).then(res=>{
                        console.log("res="+Object.keys(res.obj).join(","))
                        node.send([res.obj.context, res.obj.values])
                    })
                });
                
            }
            console.log("Registering: "+it)
            RED.nodes.registerType(it, def_func);
        });
        // Tags interface
        //client.apis.pet.addPet({id: 1, name: "bobby"}).then(...)

        // TryItOut Executor, with the `spec` already provided
        //client.execute({operationId: 'addPet', parameters: {id: 1, name: "bobby") }).then(...)
        });
        await promise
    }()

}
