import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { CredenceCert } from "../target/types/credence_cert";

describe("credence_cert", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.credenceCert as Program<CredenceCert>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
