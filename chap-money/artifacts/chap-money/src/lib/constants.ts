export type Operator = {
    label: string;
    mode: string;
    color: string;
    isTest?: boolean;
    };

    export type Country = {
    id: string;
    code: string;
    flag: string;
    dialCode: string;
    name: string;
    phoneLength: number;
    phonePrefix?: string;
    phonePlaceholder?: string;
    operators: Operator[];
    };

    // 6 pays no-redirect confirmés par FedaPay (docs.fedapay.com/payment-methods)
    // Mali et Burkina Faso exclus : redirect uniquement côté FedaPay.
    export const COUNTRIES: Country[] = [
    {
      id: "BEN",
      code: "bj",
      flag: "🇧🇯",
      dialCode: "229",
      name: "Bénin",
      phoneLength: 10,       // Nouveau format depuis 2022 : 01XXXXXXXX
      phonePrefix: "01",
      phonePlaceholder: "01XXXXXXXX",
      operators: [
        { label: "MTN",       mode: "mtn_open",  color: "#FFD700" },
        { label: "MOOV",      mode: "moov",      color: "#FF6B1A" },
        { label: "CELTIIS",   mode: "sbin",      color: "#4A90D9" },
        { label: "Momo Test", mode: "momo_test", color: "#6366F1", isTest: true },
      ],
    },
    {
      id: "TGO",
      code: "tg",
      flag: "🇹🇬",
      dialCode: "228",
      name: "Togo",
      phoneLength: 8,        // 8 chiffres : ex. 90123456
      phonePlaceholder: "90123456",
      operators: [
        { label: "MOOV",      mode: "moov_tg",   color: "#FF6B1A" },
        { label: "Togocom",   mode: "togocel",   color: "#0070C0" },
        { label: "Momo Test", mode: "momo_test", color: "#6366F1", isTest: true },
      ],
    },
    {
      id: "CIV",
      code: "ci",
      flag: "🇨🇮",
      dialCode: "225",
      name: "Côte d'Ivoire",
      phoneLength: 10,       // 10 chiffres : ex. 0712345678
      phonePlaceholder: "0712345678",
      operators: [
        { label: "MTN",       mode: "mtn_ci",    color: "#FFD700" },
        { label: "Momo Test", mode: "momo_test", color: "#6366F1", isTest: true },
      ],
    },
    {
      id: "NER",
      code: "ne",
      flag: "🇳🇪",
      dialCode: "227",
      name: "Niger",
      phoneLength: 8,        // 8 chiffres : ex. 96123456
      phonePlaceholder: "96123456",
      operators: [
        { label: "Airtel",    mode: "airtel_ne",  color: "#E53935" },
        { label: "Momo Test", mode: "momo_test",  color: "#6366F1", isTest: true },
      ],
    },
    {
      id: "SEN",
      code: "sn",
      flag: "🇸🇳",
      dialCode: "221",
      name: "Sénégal",
      phoneLength: 9,        // 9 chiffres : ex. 771234567
      phonePlaceholder: "771234567",
      operators: [
        { label: "Free",      mode: "free_sn",   color: "#E53935" },
        { label: "Momo Test", mode: "momo_test", color: "#6366F1", isTest: true },
      ],
    },
    {
      id: "GIN",
      code: "gn",
      flag: "🇬🇳",
      dialCode: "224",
      name: "Guinée",
      phoneLength: 9,        // 9 chiffres : ex. 621234567
      phonePlaceholder: "621234567",
      operators: [
        { label: "MTN",       mode: "mtn_open_gn", color: "#FFD700" },
        { label: "Momo Test", mode: "momo_test",   color: "#6366F1", isTest: true },
      ],
    },
    ];
    