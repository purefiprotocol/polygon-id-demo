/* eslint-disable jsx-a11y/anchor-is-valid */

import { useState, useRef, useEffect } from 'react';
import { PureFI, PureFIErrorCodes } from '@purefi/verifier-sdk';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { useWallet, useUrls } from '../../hooks';
import { capitalizeFirstLetter } from '../../utils';
import {
  DEFAULT_SIGN_TYPE,
  DEFAULT_CUSTOM_SIGNER_URL,
  DEFAULT_RULE_TYPE_VALUES,
  DEFAULT_RULE_TYPE,
  ZERO_ADDRESS,
} from '../../config';

const TheForm = () => {
  const toastRef = useRef();
  const { account, chain } = useWallet();
  const urls = useUrls();

  const [customSignerUrl, setCustomSignerUrl] = useState(
    DEFAULT_CUSTOM_SIGNER_URL
  );

  const ruleId = DEFAULT_RULE_TYPE_VALUES[DEFAULT_RULE_TYPE];
  const receiver = ZERO_ADDRESS;
  const [dataPack, setDataPack] = useState({});

  const [chainId, setChainId] = useState(chain.id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chain.unsupported) {
      setChainId(chain.id);
    }
  }, [chain]);

  useEffect(() => {
    const pack = {
      sender: account,
      receiver,
      chainId: +chainId,
      ruleId,
    };

    setDataPack(pack);
  }, [ruleId, chainId, receiver, account]);

  const checkValidity = () => {
    return customSignerUrl.length > 0 && !!chainId;
  };

  const sumbitHandler = async () => {
    const isValid = checkValidity();

    if (!isValid) {
      return;
    }

    const message = JSON.stringify(dataPack);

    // custom signer flow
    try {
      setLoading(true);
      toastRef.current = toast.loading('Pending...');

      const payload = {
        message,
      };

      const response = await fetch(customSignerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { signature } = await response.json();

        try {
          const payload = {
            message,
            signature,
          };

          PureFI.setIssuerUrl(urls.issuer);
          await PureFI.verifyRule(payload, DEFAULT_SIGN_TYPE);
          toast.success('Success!');
          const url = `${urls.dashboard}/polygon-id`;
          window.open(url, '_blank');
        } catch (error) {
          if (
            error.code === PureFIErrorCodes.FORBIDDEN &&
            error?.message === 'KYC required'
          ) {
            const url = `${urls.dashboard}/kyc`;
            window.open(url, '_blank');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await response.json();
        const errorMessage = `Incorrect custom signer usage.\n${capitalizeFirstLetter(
          error
        )}`;
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = `${error?.message}.\nHighly likely custom signer is offline`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(toastRef.current);
    }
  };

  const customSignerUrlClassName = classNames({
    'form-control': true,
  });

  return (
    <div className="row justify-content-md-center">
      <div className="col col-xs-12 col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Demo Settings</h4>
          </div>
          <div className="card-body">
            <form>
              <div className="form-group">
                <div className="row align-items-center">
                  <div className="col-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="useCustomSigner"
                        value={true}
                        onChange={() => {}}
                        checked
                        readOnly
                      />
                      <label
                        className="form-check-label"
                        htmlFor="useCustomSigner"
                      >
                        Use Custom Signer
                      </label>
                    </div>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className={customSignerUrlClassName}
                      id="customSignerUrl"
                      name="customSignerUrl"
                      value={customSignerUrl}
                      onChange={(e) => setCustomSignerUrl(e.target.value)}
                      placeholder="custom signer url"
                      readOnly={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group mb-0">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="dataPack">
                      DataPack / Message
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      id="dataPack"
                      name="dataPack"
                      value={JSON.stringify(dataPack, undefined, 2)}
                      onChange={() => {}}
                      rows={Math.max(6, Object.keys(dataPack).length + 2)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col col-xs-12 col-md-8 mb-4">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-dark"
            onClick={sumbitHandler}
          >
            KYC via PureFi
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheForm;
