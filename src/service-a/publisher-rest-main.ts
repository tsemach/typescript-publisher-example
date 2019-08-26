import createLogger from 'logging';
const logger = createLogger('Publication-REST-Service-A');

import { TxRoutePointRegistry, TxJob, TxTask } from 'rx-txjs';

import { PublisherREST,  } from 'rx-txjs-publisher';
import { PublisherRESTEndPointConfig } from 'rx-txjs-publisher';
import PublisherRESTApplication from '../publisher-rest-application';
import PublisherRESTData from '../publisher-rest-data';

import { R1Component } from './R1Component';
import { R2Component } from './R2Component';
import { R3Component } from './R3Component';

const { PORT = 3001 } = process.env;

if ( ! PORT ) {
  console.error("<usage> missing PORT enviroment");

  process.exit(1);
}

let withOutEndPoint = false;
if (process.argv.length > 2) {
  withOutEndPoint = process.argv[2] === 'withOutEndPoint';
}

async function run() {
  const config: PublisherRESTEndPointConfig = {
    name: 'service-a',
    host: 'localhost', 
    port: +PORT,
    route: '/v1/publish',
  }

  PublisherREST.instance.setApplication(PublisherRESTApplication.instance.app, config);

  new R1Component();
  new R2Component();
  new R3Component();        

  if ( ! withOutEndPoint ) {
    PublisherREST.instance.addEndPoint({name: 'service-b', host: 'localhost', port: 3002, route: '/v1/publish'});
    PublisherREST.instance.addEndPoint({name: 'service-c', host: 'localhost', port: 3003, route: '/v1/publish'});  
  }

  const server = PublisherRESTApplication.instance.listen('localhost', +PORT);
  server.on('listening', async () => {
    
    setTimeout(async () => {
      const R1 = await TxRoutePointRegistry.instance.get('SERVICE-B::R1');
      logger.info("[service-a] found mountpoint R1.name:", R1.name);
      const R2 = await TxRoutePointRegistry.instance.get('SERVICE-B::R1');    
      logger.info("[service-a] found mountpoint R2.name:", R2.name);
      const R3 = await TxRoutePointRegistry.instance.get('SERVICE-B::R1');    
      logger.info("[service-a] found mountpoint R3.name:", R3.name);

      const job = new TxJob('job-1');

      job.add(await TxRoutePointRegistry.instance.get('SERVICE-B::R1'));
      job.add(await TxRoutePointRegistry.instance.get('SERVICE-B::R2'));
      job.add(await TxRoutePointRegistry.instance.get('SERVICE-B::R3'));

      job.execute(new TxTask<any>(
        {source: 'service-a'},
        {jobId: job.getUuid()}
      ));
    }, 2000);

    if (process.send) {
      process.send({status: 'service-a:up', data: {}});
    }
  });
}

process.on('message', (msg: PublisherRESTData) => {  
  logger.info('[service-a] message from parent:', msg);

  if (msg.status === 'service-a:get') {
    process.send({status: 'service-a:get', data: PublisherREST.instance.getState()});
  }

  if (msg.status === 'service-a:exit') {
    logger.info('[service-a:exit] service-a going to exist')

    process.exit(0);
  }
});

run();
