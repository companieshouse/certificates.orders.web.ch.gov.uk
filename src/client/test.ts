import {createApiClient} from "ch-sdk-node";

(async () => {
    const api = createApiClient("F0v8XszSNH4R2-CdM1ZozNaNIrXUvAyZuOvkHm6cZYTdcG4RnlFL6m50FNDysccklk4u9884Tsjx14EHgQrpfg");
    const profile = await api.certificateItem.getCertificateItem("CHS00000000000000001");

    console.log(profile);
})();
