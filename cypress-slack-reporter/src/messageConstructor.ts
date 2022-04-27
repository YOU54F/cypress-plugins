import { cypressRunStatus } from './slack';
import { Blocks, Message, Elements } from 'slack-block-builder';
import { Appendable, BlockBuilder } from 'slack-block-builder/dist/internal';

export const messageConstructor = ({
  headingText,
  channel,
  status,
  customBlocks
}: {
  headingText?: string;
  channel?: string;
  status: cypressRunStatus;
  customBlocks?: Appendable<BlockBuilder>;
}) => {
  const messageBuilder = Message({ channel, text: headingText }).blocks(
    Blocks.Section({
      text: headingText
    }),
    Blocks.Divider(),
    Blocks.Actions().elements(
      status !== cypressRunStatus['build:failed']
        ? Elements.Button({
            text: 'Test Report'
          })
            .danger(status === cypressRunStatus['test:failed'])
            .primary(status !== cypressRunStatus['test:failed'])
        : undefined,
      Elements.Button({
        text: 'Build Logs'
      })
        .danger(status === cypressRunStatus['build:failed'])
        .primary(status !== cypressRunStatus['build:failed'])
    )
  );
  return customBlocks
    ? messageBuilder.blocks(...customBlocks).buildToObject()
    : messageBuilder.buildToObject();
};
