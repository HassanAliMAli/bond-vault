import { describe, it, expect } from "vitest";
import {
  bondNumberSchema,
  denominationSchema,
  createBondSchema,
  updateBondSchema,
  paymentSchema,
  ocrUsageSchema,
  importSchema,
  notificationPrefsSchema,
  updateProfileSchema,
  createDrawSchema,
  createWinningNumberSchema,
  updateUserSchema,
  updateSettingsSchema,
  contactSchema,
  updateDrawSchema,
} from "@/lib/server/validations";

describe("bondNumberSchema", () => {
  it("accepts exactly 6 digits", () => {
    expect(bondNumberSchema.safeParse("123456").success).toBe(true);
  });

  it("rejects fewer than 6 digits", () => {
    expect(bondNumberSchema.safeParse("12345").success).toBe(false);
  });

  it("rejects more than 6 digits", () => {
    expect(bondNumberSchema.safeParse("1234567").success).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(bondNumberSchema.safeParse("12345a").success).toBe(false);
    expect(bondNumberSchema.safeParse("abc123").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(bondNumberSchema.safeParse("").success).toBe(false);
  });
});

describe("denominationSchema", () => {
  const validDenominations = [100, 200, 750, 1500, 7500, 25000, 40000];

  for (const d of validDenominations) {
    it(`accepts ${d}`, () => {
      expect(denominationSchema.safeParse(d).success).toBe(true);
    });
  }

  it("rejects 0", () => {
    expect(denominationSchema.safeParse(0).success).toBe(false);
  });

  it("rejects non-standard amount", () => {
    expect(denominationSchema.safeParse(500).success).toBe(false);
    expect(denominationSchema.safeParse(99999).success).toBe(false);
  });
});

describe("createBondSchema", () => {
  it("accepts valid bond data", () => {
    const r = createBondSchema.safeParse({ bondNumber: "123456", denomination: 100 });
    expect(r.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(createBondSchema.safeParse({}).success).toBe(false);
    expect(createBondSchema.safeParse({ bondNumber: "123456" }).success).toBe(false);
    expect(createBondSchema.safeParse({ denomination: 100 }).success).toBe(false);
  });
});

describe("updateBondSchema", () => {
  it("accepts partial update", () => {
    expect(updateBondSchema.safeParse({ bondNumber: "123456" }).success).toBe(true);
    expect(updateBondSchema.safeParse({ denomination: 200 }).success).toBe(true);
    expect(updateBondSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid denomination in partial update", () => {
    expect(updateBondSchema.safeParse({ denomination: 999 }).success).toBe(false);
  });
});

describe("paymentSchema", () => {
  it("accepts valid planId", () => {
    expect(paymentSchema.safeParse({ planId: "plan_123" }).success).toBe(true);
  });

  it("rejects empty planId", () => {
    expect(paymentSchema.safeParse({ planId: "" }).success).toBe(false);
    expect(paymentSchema.safeParse({}).success).toBe(false);
  });
});

describe("ocrUsageSchema", () => {
  it("accepts empty body", () => {
    expect(ocrUsageSchema.safeParse({}).success).toBe(true);
  });

  it("ignores extra body fields", () => {
    expect(ocrUsageSchema.safeParse({ bondNumber: "abc", denomination: 100 }).success).toBe(true);
  });
});

describe("importSchema", () => {
  for (const ft of ["csv", "xlsx", "txt"] as const) {
    it(`accepts ${ft} file type`, () => {
      expect(importSchema.safeParse({ fileType: ft }).success).toBe(true);
    });
  }

  it("rejects unsupported file type", () => {
    expect(importSchema.safeParse({ fileType: "pdf" }).success).toBe(false);
  });
});

describe("notificationPrefsSchema", () => {
  it("accepts partial preferences", () => {
    expect(notificationPrefsSchema.safeParse({ emailEnabled: true }).success).toBe(true);
    expect(notificationPrefsSchema.safeParse({}).success).toBe(true);
    expect(notificationPrefsSchema.safeParse({
      emailEnabled: false, whatsappEnabled: true, smsEnabled: false,
    }).success).toBe(true);
  });

  it("rejects non-boolean values", () => {
    expect(notificationPrefsSchema.safeParse({ emailEnabled: "yes" }).success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts partial profile", () => {
    expect(updateProfileSchema.safeParse({ fullName: "John" }).success).toBe(true);
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });
});

describe("createDrawSchema", () => {
  it("accepts valid draw data", () => {
    expect(createDrawSchema.safeParse({ denomination: 100, drawNumber: "98", drawDate: "2025-01-15" }).success).toBe(true);
  });

  it("accepts optional source", () => {
    expect(createDrawSchema.safeParse({ denomination: 200, drawNumber: "99", drawDate: "2025-02-01", source: "SBP" }).success).toBe(true);
  });

  it("rejects missing drawNumber", () => {
    expect(createDrawSchema.safeParse({ denomination: 100, drawDate: "2025-01-15" }).success).toBe(false);
  });

  it("rejects missing drawDate", () => {
    expect(createDrawSchema.safeParse({ denomination: 100, drawNumber: "98" }).success).toBe(false);
  });
});

describe("createWinningNumberSchema", () => {
  it("accepts valid winning number", () => {
    const r = createWinningNumberSchema.safeParse({ bondNumber: "123456", prizeType: "1st Prize", prizeAmount: 1000000 });
    expect(r.success).toBe(true);
  });

  it("rejects invalid prize type", () => {
    expect(createWinningNumberSchema.safeParse({ bondNumber: "123456", prizeType: "Grand Prize", prizeAmount: 1000000 }).success).toBe(false);
  });

  it("rejects non-positive prize amount", () => {
    expect(createWinningNumberSchema.safeParse({ bondNumber: "123456", prizeType: "2nd Prize", prizeAmount: 0 }).success).toBe(false);
    expect(createWinningNumberSchema.safeParse({ bondNumber: "123456", prizeType: "2nd Prize", prizeAmount: -100 }).success).toBe(false);
  });

  it("rejects invalid bond number", () => {
    expect(createWinningNumberSchema.safeParse({ bondNumber: "12", prizeType: "3rd Prize", prizeAmount: 500000 }).success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("accepts valid status values", () => {
    expect(updateUserSchema.safeParse({ status: "active" }).success).toBe(true);
    expect(updateUserSchema.safeParse({ status: "suspended" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(updateUserSchema.safeParse({ status: "deleted" }).success).toBe(false);
  });

  it("accepts empty object", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });
});

describe("updateSettingsSchema", () => {
  it("accepts valid key-value", () => {
    expect(updateSettingsSchema.safeParse({ key: "max_ocr", value: "50" }).success).toBe(true);
  });

  it("rejects empty key", () => {
    expect(updateSettingsSchema.safeParse({ key: "", value: "50" }).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(updateSettingsSchema.safeParse({ key: "max_ocr", value: "" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts valid contact form", () => {
    expect(contactSchema.safeParse({ name: "John", email: "john@example.com", message: "Hello, I have a question about my account." }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(contactSchema.safeParse({ name: "John", email: "not-an-email", message: "Hello, I have a question about my account." }).success).toBe(false);
  });

  it("rejects short message", () => {
    expect(contactSchema.safeParse({ name: "John", email: "john@example.com", message: "Hi" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(contactSchema.safeParse({ email: "john@example.com", message: "Hello, I have a question about my account." }).success).toBe(false);
  });
});

describe("updateDrawSchema", () => {
  it("accepts partial draw update", () => {
    expect(updateDrawSchema.safeParse({ drawNumber: "100" }).success).toBe(true);
    expect(updateDrawSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(updateDrawSchema.safeParse({
      denomination: 750, drawNumber: "101", drawDate: "2025-03-01", source: "SBP", pdfR2Key: "abc123",
    }).success).toBe(true);
  });

  it("rejects invalid denomination in update", () => {
    expect(updateDrawSchema.safeParse({ denomination: 999 }).success).toBe(false);
  });
});
