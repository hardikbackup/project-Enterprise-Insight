// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

//ng build --configuration=stage --aot --output-hashing=all
export const environment = {
  production: true,
  app_url: 'https://staging.enterpriseinsight.io',
  server_url : 'https://api-staging.enterpriseinsight.io',
  encode_api_key: 'ec2-18-216-78-140',
  editor_app_url: 'https://staging-grapheditor.enterpriseinsight.io',
  editor_node_app_url: 'https://staging-grapheditor.enterpriseinsight.io',
  editor_xml_svg_converter_url: 'https://staging-grapheditor.enterpriseinsight.io/return_svg.html',
  view_generator_box_url: 'https://staging-grapheditor.enterpriseinsight.io/view-generator/box-view.html',
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
