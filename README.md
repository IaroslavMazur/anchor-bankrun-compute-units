An example project demonstrating the variable Compute Unit consumption of the `test_cu_consumption` Instruction. The CU consumption for this Ix varies between 30,820 and 39,820 CUs, while it's supposed to be constant, given that the Ix is being executed with the very same context.

Run `anchor t`/`anchor t --skip-build` multiple times - and monitor the CUs consumed by the test Tx.
