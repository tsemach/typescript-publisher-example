# Example Project for rx-txjs-publisher

[rx-txjs-publisher](https://www.npmjs.com/package/rx-txjs-publisher) (typescript-publisher on github.com) package is including a suite of pulication tools of [rx-txjs](https://www.npmjs.com/package/rx-txjs) components. It able to advertise objects over a group of end points services.

## To Run the Example
1. run ````npm install```` 
2. run ````npm run build````
>Note: you need typescript compiler and ts-node installed.

The example include three services that are part of the publication group, service-a, service-b, service-c. 

#### Run The Services
On three different terminals run the following commands:

* ````ts-node src/service-c/publisher-rest-main.ts````
* ````ts-node src/service-b/publisher-rest-main.ts````

Service 'service-c' and 'service-b' are now running on two different terminals.

Now run 'service-a':
* ````ts-node src/service-a/publisher-rest-main.ts````

**`service-a`** run a rx-txjs's job it use three components living in 'service-b' but it has no idea nor he care where they are coming from and how to access them. The publication tools and rx-txjs do all the work. 

Running 'service-a' job actually activate three components buisness logic components on 'service-b'.

After thet you can examine the publication status of each comonents by:
1. ````bash curl http://localhost:3001/v1/publish/summary````
2. ````bash curl http://localhost:3002/v1/publish/summary````
3. ````bash curl http://localhost:3003/v1/publish/summary````

This will print a json object include infomration about the publication.
Something like:
````json
{
  "success": true,
  "data": {
    "name": "service-a",
    "summary": {
      "components": 6,
      "publishs": 6
    },
    "components": [
      "SERVICE-B::R1",
      "SERVICE-B::R2",
      "SERVICE-B::R3",
      "SERVICE-C::R1",
      "SERVICE-C::R2",
      "SERVICE-C::R3"
    ],
    "publishs": [
      "SERVICE-A::R1 --> service-b",
      "SERVICE-A::R2 --> service-b",
      "SERVICE-A::R3 --> service-b",
      "SERVICE-A::R1 --> service-c",
      "SERVICE-A::R2 --> service-c",
      "SERVICE-A::R3 --> service-c"
    ],
    "discovers": [],
    "endpoints": [
      {
        "name": "service-b",
        "host": "localhost",
        "port": 3002,
        "route": "/v1/publish"
      },
      {
        "name": "service-c",
        "host": "localhost",
        "port": 3003,
        "route": "/v1/publish"
      }
    ]
  }
````
>This show that 'service-a' received three components from services b,c and publish it's components to them as well.

