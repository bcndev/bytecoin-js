// Copyright 2019 The Bytecoin developers.
// Licensed under the Apache License, Version 2.0.

import {checkAddressFormat, checkAuditFormat, checkProofFormat} from "./index";

test("check valid addresses", () => {
  expect(checkAddressFormat("21UQFLdH7WvPZEd8HNwXncHtDwFvv4GRqaN3R4cWyuw2TRZxRtRPb7FFTxfcwwQsqYSD2EqhgVCLsGdRdejAoHFHAHJrxxo")).toBe(true);
  expect(checkAddressFormat("bcnZ6VSM78fQNL5js7VnCybbs3ojLbdAD4DfbdJkUqghYWLqXeEgdyo9UyiAZKnB548DK1ofu8wed3jYCPT62zpf2R97SejoT7")).toBe(true);
});

test("check invalid addresses", () => {
  expect(checkAddressFormat("21UQFLdH7WvPZEd8HNwXncHtDwFvv4GRqaM3R4cWyuw2TRZxRtRPb7FFTxfcwwQsqYSD2EqhgVCLsGdRdejAoHFHAHJrxxo")).toBe(false);
  expect(checkAddressFormat("bcnZ6VSM78fQNL5js7VnCybbs3ojLbdAD4DfcdJkUqghYWLqXeEgdyo9UyiAZKnB548DK1ofu8wed3jYCPT62zpf2R97SejoT7")).toBe(false);
});

test("check valid proof string", () => {
  expect(checkProofFormat("bcn1PRoof1R1mqH48QepLRigshghPWVQhg3sYRmTGSjBXKnbY1G8EwTYnH26C7Rr5Q1oP38ivqYCYcvatoEc4NZuiDCHd9cbKKxD2aY1Ha8VMaDCqoR7aACmvYi4Bs2ahv1u1S7tewB1KP3i48KKp8LFSvhreQAAFy1tdJrH4zgKpkEFC4VfYHaEjbkaqWQCB9jRbCa4urPFLrmp7Xth3TUrkUMtD57SAAytKYGRRr1CpXpkWLE9nyDc4NaJMWt58MScYdjy7Se5wuS3rGMJLs6W43rpwi2wyRqxWiUhkA1R5dQ9McK5AcyMzdNAVJAbYuHkhE7nETVHfx9UMzeXECtWCh5ZcQZqX4yJwZUiVxdDPwBHJNRCjZLe9aRreKwPcc3Q3gXnY1XSR5e64vXbRDbLNnHa22BBCAUr5fn61Nw7SNx5iKfSJduhVng2X4uFW4VJ3ghWCiXXfe")).toBe(true);
});

test("check valid audit string", () => {
  expect(checkAuditFormat("bcnAUDitFszLrCeDiEbUYtf5kpxGuKbpp5qcoRtm9wiU1BnkXMJtNauZTntpwuPVAAKxnzWdfEAoSFEBtTNpLsqa4D1LjkxnewZd86GW1w8X6959hPC1rK5YqBkM2McDaURE6hQNGpxFbUBTRfGASWMGLxHBQ4KaUGTbcRHkDuB1iXotHkC7L5XczQ574fRSTMXDjKfj2HKHMbCztU9bqDWqesysdLim6CatQSdLmny7cf8pUBXzHdeJ8UmwVW4tu51BZBuCPrrbzHr8LRnCCEAeuS")).toBe(true);
});
