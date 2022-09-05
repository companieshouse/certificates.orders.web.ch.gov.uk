const restricted = "AÀÁÂÃÄÅĀĂĄǺaàáâãäåāăąǻÆǼæǽBbCcçćĉċčDÞĎĐdþďđEÈÉÊËĒĔĖĘĚeèéêëēĕėęěFfGĜĞĠĢgĝğġģHĤĦhĥħIÌÍÎÏĨĪĬĮİiìíîïĩīĭįJĴjĵKĶkķLĹĻĽĿŁlĺļľŀłMmNÑŃŅŇŊnñńņňŋOÒÓÔÕÖØŌŎŐǾoòóôõöøōŏőǿŒœPpQqRŔŖŘrŕŗřSŚŜŞŠsśŝşšTŢŤŦtţťŧUÙÚÛÜŨŪŬŮŰŲuùúûüũūŭůűųVvWŴẀẂẄwŵẁẃẅXxYỲÝŶŸyỳýŷÿZŹŻŽzźżž&@£$€¥*=#%+‘ʼ'()/\\[]{}<>!«»?“ˮ\"0123456789.,:;–- \r\n";

export const validateCharSet = (input) => {
    return input === undefined ? undefined : input.split("").find((ch: string) => restricted.indexOf(ch) === -1);
};
