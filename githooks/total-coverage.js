var fs = require('fs');
require('shelljs/global');
require('./exec-command');

var modules = ['WorkBench',
               'ECDD-Plus',
               'WB-UI-Base-App',
               'WB-UI-Core',
               'WB-UI-Components',
               'WB-UI-FormServices',
               'WB-UI-Clients',
               'WB-UI-CallReports'];

mkdir('-p', 'tmp');

for (var i = 0; i < modules.length; i++) {
    execCmd('curl -s -u readonly:readonly -o tmp/' + modules[i] + '-pipelines.json http://192.168.3.139:8153/go/api/pipelines/' + modules[i] + '/history/0');

    var build = JSON.parse(fs.readFileSync('tmp/' + modules[i] + '-pipelines.json', 'utf8'));
    var buildNumber = build.pipelines[0].label;

    for (buildNumber; buildNumber >= 1; buildNumber--) {
        execCmd('curl -s -u readonly:readonly -o tmp/' + modules[i] + '-coverage.json http://192.168.3.139:8153/go/files/' + modules[i] + '/' + buildNumber + '/Build/1/build/coverage.json');

        if (fs.existsSync('tmp/' + modules[i] + '-coverage.json')) {
		
		 try {
            var report = JSON.parse(fs.readFileSync('tmp/' + modules[i] + '-coverage.json', 'utf8'));
            var actualCoverage = report.coverage.total.percentage;
            console.log("Total test coverage for module " +  modules[i] + "(Build-" + buildNumber + ")" + " : " + actualCoverage + "%");
            break;
			}catch (e) {
                continue;
            }
        } else {
            console.log(" returning to previous build ");
            if (buildNumber === 1) {
                console.log("Coverage file not found for module: " + modules[i]);
            }
        }
    }
}
