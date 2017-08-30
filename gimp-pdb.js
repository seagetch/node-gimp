module.exports = function(RED) {
    var request = require("request");
    RED.Swagger = require("swagger-client");

    RED.swagger_client = null;
    RED.hello_test = "Hello";

    registration = async function () {
      promise = RED.Swagger('http://localhost:8920/api/v1/pdb/')
      .then( client => {
        RED.swagger_client = client;
        console.log(Object.keys(client.apis.default))
        Object.keys(client.apis.default).forEach(function(it){
          var def_func = function(config) {
              RED.nodes.createNode(this, config);
              var node = this;
              node.on('input', function(msg) {
                operation = client.apis.default[it](msg.payload).then(res=>{
                    node.send(msg)
                })
              });
          }
          console.log("register: "+it)
          RED.nodes.registerType(it, def_func);
        });
        // Tags interface
        //client.apis.pet.addPet({id: 1, name: "bobby"}).then(...)

        // TryItOut Executor, with the `spec` already provided
        //client.execute({operationId: 'addPet', parameters: {id: 1, name: "bobby") }).then(...)
      });
      await promise
    }()

    /*
    request({
        uri: "http://localhost:8920/api/v1/pdb/",
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {
        console.log(body);
    });
    */

}
