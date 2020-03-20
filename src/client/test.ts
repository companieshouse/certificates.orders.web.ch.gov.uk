import {createApiClient} from "ch-sdk-node";

(async () => {
    const api = createApiClient(undefined, "rs2YV0Q0F8BKfgXM17yhyxkOpRCH0PFGmFTUxhfhW_J7PheKQXJL0HQmagHY-nCGjWrr0amt6tUqe0-drEleHQ", "http://api.chs-dev.internal:4001");
    const sdkResponse =
        await api.companyProfile.getCompanyProfile("00006400");
        //console.log(sdkResponse);
    const profile = await api.certificateItem.getCertificateItem("CHS00000000000000001");

    console.log(profile);
})();
