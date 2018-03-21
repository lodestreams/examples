import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  Typography,
  FormControl,
  InputLabel,
  Input,
} from 'material-ui';
import * as QRCode from 'qrcode.react';

import { accounts, accountsRest } from './accounts';

interface State {
  secret: any;
  oneTimeCode: string;
}

class TwoFactor extends React.Component<RouteComponentProps<{}>, State> {
  state = {
    secret: null as any,
    oneTimeCode: '',
  };

  async componentDidMount() {
    this.onGetTwoFactorSecret();
  }

  onGetTwoFactorSecret = async () => {
    const { secret } = await accountsRest.getTwoFactorSecret();
    this.setState({ secret });
  };

  onChangeOneTimeCode = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ oneTimeCode: target.value });
  };

  onSetTwoFactor = async () => {
    try {
      // configure the module first
      await accounts.config();
      // refresh the session to get a new accessToken if expired
      await accounts.refreshSession();
      const tokens = await accounts.tokens();
      await accountsRest.twoFactorSet(
        this.state.secret,
        this.state.oneTimeCode,
        {
          'accounts-access-token': tokens.accessToken,
        }
      );
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  render() {
    const { secret, oneTimeCode } = this.state;
    if (!secret) {
      return null;
    }
    return (
      <div>
        <Typography gutterBottom>Two-factor authentication</Typography>
        <Typography gutterBottom>Backup code:</Typography>
        <Typography gutterBottom>{secret.base32}</Typography>
        <Typography gutterBottom>
          Use Google Authenticator for example
        </Typography>
        <QRCode value={secret.otpauth_url} />
        <Typography gutterBottom>Confirm with one-time code:</Typography>
        <FormControl margin="normal">
          <InputLabel htmlFor="one-time-code">One time code</InputLabel>
          <Input
            id="one-time-code"
            value={oneTimeCode}
            onChange={this.onChangeOneTimeCode}
          />
        </FormControl>
        <Button onClick={this.onSetTwoFactor}>Submit</Button>
      </div>
    );
  }
}

export default TwoFactor;