use solana_program::{pubkey::Pubkey,account_info::{AccountInfo,next_account_info},entrypoint,entrypoint::{ProgramResult},program::{invoke},instruction::{Instruction,AccountMeta}};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id : &Pubkey,
    account_info : &[AccountInfo],
    instruction_data : &[u8]
) -> ProgramResult {

    let mut iter = account_info.iter();
    let data_account = next_account_info(&mut iter)?;
    let double_account_info = next_account_info(&mut iter)?;

    let instruction = Instruction{
        program_id : *double_account_info.key,
        accounts : vec![AccountMeta{
            is_signer : true,
            is_writable: true,
            pubkey : *data_account.key
        }],
        data : vec![]
    };

    invoke(&instruction,&[data_account.clone()])?;
    Ok(())
}