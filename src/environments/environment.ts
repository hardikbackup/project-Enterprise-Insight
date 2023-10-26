// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  app_url: 'http://localhost:4200',
  server_url : 'http://18.189.134.39:8080',
  encode_api_key: 'ec2-18-216-78-140',
  editor_app_url: 'http://mxgraph.test',
  editor_node_app_url: 'http://18.189.134.39:8082',
  editor_xml_svg_converter_url: 'http://mxgraph.test/return_svg.html',
  view_generator_box_url: 'http://mxgraph.test/view-generator/box-view.html',
  model_viewer_default_left_sidebar_width: 337,
  yFilesLicense: {
    "company": "Texas Software Solutions LLC",
    "contact": "Sergei Rabtsevich",
    "date": "05/18/2022",
    "distribution": false,
    "domains": [
      "*"
    ],
    "email": "rabtsevichser@gmail.com",
    "fileSystemAllowed": true,
    "licensefileversion": "1.1",
    "localhost": true,
    "oobAllowed": true,
    "package": "complete",
    "product": "yFiles for HTML",
    "projectname": "Enterprise Insight",
    "type": "project",
    "version": "2.4",
    "watermark": "yFiles HTML Development License",
    "key": "cdcbdaaaaa4953f48a172a21bbc7de0f0a30a60e"
  }
};

// export const environment = {
//   production: true,
//   app_url: 'http://18.189.134.39',
//   server_url : 'http://18.189.134.39:8080',
//   encode_api_key: 'ec2-18-216-78-140',
//   editor_app_url: 'http://18.189.134.39:8082',
//   editor_node_app_url: 'http://18.189.134.39:8082',
//   editor_xml_svg_converter_url: 'http://texas-software.com:8083/return_svg.html'
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
//
//ng build --configuration production
