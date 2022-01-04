/* globals commonTests */
const runButton = document.querySelector('#run');
const downloadButton = document.querySelector('#download');

const testsDiv = document.querySelector('#tests');
const testsSummaryDiv = document.querySelector('#tests-summary');
const testsDetailsElement = document.querySelector('#tests-details');

const isLocalTest = window.location.hostname === 'localhost';
const THIRD_PARTY_ORIGIN = isLocalTest ? `http://128.0.0.1:${window.location.port}` : 'https://senglehardt.netflify.app';

// object that contains results of all tests
const results = {
    page: 'storage-partitioning',
    date: null,
    results: []
};

function downloadTheResults () {
    const data = JSON.stringify(results, null, 2);
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.href = url;
    a.download = 'storage-blocking-results.json';

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();
}

function constructTestPage (topOrigin, embeddedOrigin, name) {
    return () => new Promise((resolve, reject) => {
        const testURL = new URL('/test/privacy-protections/storage-partitioning/testWindow.html', topOrigin);
        testURL.searchParams.set('embeddedOrigin', embeddedOrigin);
        testURL.searchParams.set('referringOrigin', window.location.origin);
        const testWindow = window.open(testURL.href, name);

        // TODO: do some checking to make sure the window opened
        // throw errors otherwise.

        window.addEventListener('message', (event) => {
            //if (event.origin !== window.location.origin)
            //    reject(`Message from unexpected origin ${event.origin}`)
            console.log('-----' + event.data);
            resolve(event.data);
        }, { capture: false, once: true });
    });
}

const configurations = {
    'same-site': {
        desc: 'read values in same-site iframe',
        iterations: 2,
        run: constructTestPage(window.location.origin, window.location.origin, 'same-site')
    },
    'cross-site': {
        desc: 'read values in cross-site iframe',
        iterations: 2,
        run: constructTestPage(THIRD_PARTY_ORIGIN, window.location.origin, 'cross-site')
    }
};

function setStorage (frameOrigin, data) {
    return new Promise((resolve, reject) => {
        try {
            const iframeURL = new URL(`/test/privacy-protections/storage-partitioning/iframe.html?data=${data}`, frameOrigin);
            const iframe = document.createElement('iframe');
            iframe.height = 1;
            iframe.width = 1;
            iframe.src = iframeURL.href;
            document.body.appendChild(iframe);

            window.addEventListener('message', (event) => {
                iframe.remove();
                resolve(event.data);
            }, { capture: false, once: true });
        } catch (err) {
            console.error(`Error while trying to set storage: ${err}`);
        }
    });
}

function getStorage (frameOrigin) {
    return new Promise((resolve, reject) => {
        try {
            const iframeURL = new URL('/test/privacy-protections/storage-partitioning/iframe.html', frameOrigin);
            const iframe = document.createElement('iframe');
            iframe.height = 1;
            iframe.width = 1;
            iframe.src = iframeURL.href;
            document.body.appendChild(iframe);

            window.addEventListener('message', (event) => {
                iframe.remove();
                resolve(event.data);
            }, { capture: false, once: true });
        } catch (err) {
            console.error(`Error while trying to set storage: ${err}`);
        }
    });
}

function validateValues (sameSites, crossSites, reference, random) {
    if (reference.value !== random) {
        if (reference.value === null && typeof reference.error !== 'undefined') {
            return 'error';
        }
        return 'fail';
    }

    if (
        (!sameSites.length === configurations['same-site'].iterations) ||
        (!crossSites.length === configurations['cross-site'].iterations) ||
        (!sameSites.every(v => v.value === reference.value)) ||
        (!crossSites.every(v => v.value === crossSites[0].value)) ||
        (!crossSites.every(v => v.value !== reference.value))) {
        return 'fail';
    }
    return 'pass';
}

function validateResults (allRetrievals, random) {
    const out = new Map();
    for (const api of allRetrievals.keys()) {
        const sameSiteValues = allRetrievals.get(api)['same-site'];
        const crossSiteValues = allRetrievals.get(api)['cross-site'];
        const reference = allRetrievals.get(api).reference;
        const result = validateValues(sameSiteValues, crossSiteValues, reference, random);
        out.set(api, result);
    };
    return out;
}

function displayResults (allRetrievals, testResults) {
    testsDiv.removeAttribute('hidden');

    results.results.length = 0;
    results.date = (new Date()).toUTCString();

    let all = 0;
    let failed = 0;

    testsDetailsElement.innerHTML = '';

    function updateSummary () {
        testsSummaryDiv.innerText = `Retrieved data from ${all} storage mechanisms${failed > 0 ? ` (${failed} failed)` : ''}. Click for details.`;
    }

    function getLiFromResults (api, type) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.class = 'value';
        span.innerHTML = `${type}: ${JSON.stringify(allRetrievals.get(api)[type], null, 2)}`;
        li.appendChild(span);
        return li;
    }

    for (const api of allRetrievals.keys()) {
        all++;

        const li = document.createElement('li');
        li.id = `test-${api.replace(' ', '-')}`;
        li.innerHTML = `${api} - ${testResults.get(api)}<ul></ul>`;

        const ul = li.getElementsByTagName('ul')[0];
        ul.appendChild(getLiFromResults(api, 'same-site'));
        ul.appendChild(getLiFromResults(api, 'cross-site'));

        testsDetailsElement.appendChild(li);
    };

    updateSummary();

    function addTestResult (testId, value) {
        results.results.push({
            id: testId,
            value: value
        });
    }

    testResults.forEach((status, api) => {
        addTestResult(api, status);
    });

    downloadButton.removeAttribute('disabled');
}

// From: https://stackoverflow.com/a/51321724
class DefaultMap extends Map {
    get (key) {
        if (!this.has(key)) this.set(key, this.default());
        return super.get(key);
    }

    constructor (defaultFunction, entries) {
        super(entries);
        this.default = defaultFunction;
    }
}

async function runTests () {
    const random = (Math.round(Math.random() * 1000)).toString();

    const allRetrievals = new DefaultMap(() => {
        return {
            'same-site': [],
            'cross-site': []
        };
    });

    console.log(`Setting ${random} in a same-origin iframe...`);
    const status = await setStorage(window.location.origin, random);
    console.log(status);

    console.log('Retrieving reference values from a same-origin iframe...');
    const reference = await getStorage(window.location.origin);
    console.log(reference);
    reference.forEach(retrieval => {
        allRetrievals.get(retrieval.api).reference = {
            value: retrieval.value,
            error: retrieval.error
        };
    });

    for (const type in configurations) {
        const test = configurations[type];
        for (let i = 0; i < test.iterations; i++) {
            console.log(`Running test ${test.desc} iteration ${i}`);
            const retrieval = await test.run();
            console.log(retrieval);

            retrieval.forEach(retrieval => {
                allRetrievals.get(retrieval.api)[type].push({
                    value: retrieval.value,
                    error: retrieval.error
                });
            });
        }
    }
    console.log(allRetrievals);
    const testResults = validateResults(allRetrievals, random);
    console.log();
    displayResults(allRetrievals, testResults);
}

downloadButton.addEventListener('click', () => downloadTheResults());

// run tests if button was clicked or…
runButton.addEventListener('click', () => runTests());

// if url query is '?store' store the data immadiatelly
if (document.location.search === '?run') {
    runTests();
}
