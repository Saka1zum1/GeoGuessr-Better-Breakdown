// PANORAMA DATA & METADATA
function getGeneration(worldsize, country, lat, date) {
    if (!worldsize) return 'Ari';
    if (worldsize === 1664) return 'Gen1';
    if (worldsize === 8192) return 'Gen4';
    if (worldsize === 6656) {
        const dateStr = date.toISOString().slice(0, 7);
        const gen2Countries = new Set(['AU', 'BR', 'CA', 'CL', 'JP', 'GB', 'IE', 'NZ', 'MX', 'RU', 'US', 'IT', 'DK', 'GR', 'RO',
                                       'PL', 'CZ', 'CH', 'SE', 'FI', 'BE', 'LU', 'NL', 'ZA', 'SG', 'TW', 'HK', 'MO', 'MC', 'NO',
                                       'SM', 'AD', 'IM', 'JE', 'FR', 'DE', 'ES', 'PT', 'SJ']);
        const gen3Dates = {
            'BD': '2021-04', 'EC': '2022-03', 'FI': '2020-09', 'IN': '2021-10', 'LK': '2021-02', 'KH': '2022-10',
            'LB': '2021-05', 'NG': '2021-06', 'ST': '2024-02', 'US': '2019-01', 'VN': '2021-01', 'ES': '2023-01'
        };
        if (dateStr >= '2022-01') return 'BadCam'
        if (dateStr >= gen3Dates[country]) {
            if (country != 'US') return 'BadCam'
            if (country === 'US' && lat > 52) return 'BadCam'
        }

        if (gen2Countries.has(country) && dateStr <= '2011-11') {
            return dateStr >= '2010-09' ? 'Gen2/3' : 'Gen2';
        }

        return 'Gen3';
    }
}

function parseMeta(data) {
    const tags = []
    const panoId = data?.[1]?.[0]?.[1]?.[1];
    const lat = data?.[1]?.[0]?.[5]?.[0]?.[1]?.[0]?.[2];
    const lng = data?.[1]?.[0]?.[5]?.[0]?.[1]?.[0]?.[3];
    const year = data?.[1]?.[0]?.[6]?.[7]?.[0];
    const month = data?.[1]?.[0]?.[6]?.[7]?.[1];
    const worldsize = data?.[1]?.[0]?.[2]?.[2]?.[0];
    const history = data?.[1]?.[0]?.[5]?.[0]?.[8];
    const links = data?.[1]?.[0]?.[5]?.[0]?.[3]?.[0];
    const worldHeight = data?.[1]?.[0]?.[2]?.[2]?.[0];
    const worldWidth = data?.[1]?.[0]?.[2]?.[2]?.[1];

    const date = new Date(year, month - 1);
    const formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    let heading, region, locality, road, country, altitude;
    try {
        heading = data[1][0][5][0][1][2][0];
    } catch (e) {
        heading = 0
    }
    try {
        country = data[1][0][5][0][1][4];
        if (['TW', 'HK', 'MO'].includes(country)) {
            country = 'CN';
        }
    } catch (e) {
        country = null;
    }

    try {
        const address = data[1][0][3][2][1][0];
        const parts = address.split(',')
        if (parts.length > 1) {
            region = parts[parts.length - 1].trim();
            locality = parts[0].trim()
        } else {
            region = address;
        }
    } catch (e) {
        try {
            const address = data[1][0][3][2][0][0]
            const parts = address.split(',')
            if (parts.length > 1) {
                region = parts[parts.length - 1].trim();
                locality = parts[0].trim()
            }
            else region = address;
        }
        catch (e) {
            region = null;
        }
    }
    try {
        road = data[1][0][5][0][12][0][0][0][2][0];
    } catch (e) {
        road = null;
    }
    try {
        altitude = data[1][0][5][0][1][1][0]
    }
    catch (e) {
        altitude = null;
    }
    const generation = String(data[1][0][4]).includes('Google') ? getGeneration(worldsize, country, lat, date) : 'ari';
    let camera;
    if (generation == 'Gen4') {
        if (['IN', 'PR'].includes(country)) camera = 'smallcam'
        else if (['NA', 'PA', 'OM', 'QA', 'EC'].includes(country)) camera = 'gen4trekker'
    }
    const isNewRoad = !history ? 'newroad' : false;
    const tagEntries = [
        ["formattedDate", formattedDate],
        ["yearMonth", `${year}-${month}`],
        ["yearMonthShort", `${String(year).slice(2,4)}-${month}`],
        ["year", year],
        ["monthShort", MONTHS_SHORT[month-1]],
        ["monthFull", MONTHS_FULL[month-1]],
        ["country", country],
        ["region", region],
        ["locality", locality],
        ["road", road],
        ["generation", generation],
        ["camera", camera],
        ["altitude", altitude ? altitude.toFixed(2)+"m" : null],
        ["isNewRoad", isNewRoad]
    ];

    const tagFields = [];
    const tagKeys = [];

    for (const [key, value] of tagEntries) {
        if (value) {
            tagFields.push(value);
            tagKeys.push(key);
        }
    }

    return {
        lat,
        lng,
        altitude,
        panoId,
        worldHeight,
        worldWidth,
        year,
        month,
        country,
        region,
        locality,
        road,
        generation,
        links,
        history,
        heading: Math.round(heading),
        pitch: 0,
        zoom: 0,
        tags,
        tagKeys,
        tagFields,
    }
}

// ============================================================================
