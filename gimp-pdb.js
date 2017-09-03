module.exports = function(RED) {
    RED.Swagger = require("swagger-client");

    var ARG_DEFAULT_NULL = ["image", "layer", "drawable", "item", "display"]
    var METHODS = ["get","put","post","delete","patch"]
    registration = async function () {
        promise = RED.Swagger('http://localhost:8920/api/v1/pdb/')
        .then( client => {
            Object.keys(client.spec.paths).forEach(function(path) {
                var path_def = client.spec.paths[path]
                METHODS.forEach(function(method){
                    var method_def = path_def[method]
                    if (!method_def)
                      return;
                    var it = method_def.operationId;

    //            Object.keys(client.apis.default).forEach(function(it){
                    var operation = client.apis.default[it]
                    var prop_spec = method_def.parameters
                                    .filter(function(it){ return it.in == "body"; })[0]
                                    .schema.properties.arguments.properties
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
                            } else {
                                if (prop_spec[arg_key].type == 'integer' || prop_spec[arg_key].type == 'number')
                                    node.arguments[arg_key] = Number(config[conf_key]);
                                else if (prop_spec[arg_key].type == 'boolean')
                                    node.arguments[arg_key] = Boolean(config[conf_key]);
                                else
                                    node.arguments[arg_key] = config[conf_key];
                            }
                        });
                        node.on('input', function(msg) {
                            console.log(it+": msg="+Object.keys(msg).map(function(it){return it+": "+msg[it]}).join(","))
                            console.log(it+": input context="+Object.keys(msg.payload).map(function(it){return it+": "+msg.payload[it]}).join(","))
                            console.log(it+": node args="+Object.keys(node.arguments).map(function(it){return it+": "+ node.arguments[it]}).join(","))
                            var this_context = (typeof(msg.payload)=='object')? msg.payload : {}
                            operation({payload: {context: this_context, arguments: node.arguments }}).then(res=>{
                                console.log(it+": res="+Object.keys(res.obj).map(function(it){return it+": "+res.obj[it]}).join(","))
                                console.log(it+": output context="+Object.keys(res.obj.context).map(function(it){return it+": "+res.obj.context[it]}).join(","))
                                node.send([{payload: res.obj.context}, {payload: res.obj.values}])
                            })
                        });
                        
                    }
                    console.log("Registering: "+it)
                    RED.nodes.registerType(it, def_func);
                });
            });
        // Tags interface
        //client.apis.pet.addPet({id: 1, name: "bobby"}).then(...)

        // TryItOut Executor, with the `spec` already provided
        //client.execute({operationId: 'addPet', parameters: {id: 1, name: "bobby") }).then(...)
        });
        await promise
    }()

}
