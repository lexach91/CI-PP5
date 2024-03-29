import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect, setError, setMessage } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chip } from "primereact/chip";
import { OverlayPanel } from "primereact/overlaypanel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { confirmPopup } from "primereact/confirmpopup";
import { ConfirmPopup } from "primereact/confirmpopup";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const { isAuthenticated, user, redirect, loading, membership } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState({});
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const toast = useRef(null);
  const [payments, setPayments] = useState([]);
  const paymentPanel = useRef(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user && membership && membership.name !== "Free") {
      setLoadingSubscription(true);
      axios
        .get("membership-stripe")
        .then((res) => {
          setSubscription(res.data);
          setLoadingSubscription(false);
        })
        .catch((err) => {
          toast.current.show({
            severity: "error",
            detail: err.response.data.error,
          });
          setLoadingSubscription(false);
        });
    }
  }, [redirect, isAuthenticated, user, membership, dispatch]);

  useEffect(() => {
    if (membership?.name === "Free") {
      dispatch(
        setError("Your membership is free. You can't access this page.")
      );
      setRestricted(true);
    }
    if (isAuthenticated === false && loading === false) {
      dispatch(setError("You must be logged in to access this page."));
      setRestricted(true);
    }
  }, [membership, isAuthenticated, loading, dispatch]);

  if (restricted) {
    return <Navigate to="/" />;
  }

  const getPaymentHistory = async (e) => {
    setPaymentsLoading(true);
    const res = await axios.get("payment-history");
    setPayments(res.data.payments);
    setPaymentsLoading(false);
    paymentPanel.current.show(e);
  };

  const historyPanel = (
    <OverlayPanel ref={paymentPanel} showCloseIcon>
      <DataTable
        value={payments}
        loading={paymentsLoading}
        paginator={payments.length > 10}
        rows={10}
        responsive={true}
        emptyMessage="No payments found">
        <Column
          header="Date"
          sortable={true}
          body={(rowData) => {
            return new Date(rowData.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }}
        />
        <Column field="amount" header="Amount" sortable={true} />
      </DataTable>
    </OverlayPanel>
  );

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await axios.get("customer-portal");
      window.location.href = res.data.sessionUrl;
    } catch (err) {
      toast.current.show({
        severity: "error",
        detail: err.response.data.error,
      });
    }
    setPortalLoading(false);
  };

  const confirmDeletion = (e) => {
    confirmPopup({
      target: e.currentTarget,
      message: "Are you sure you want to cancel your subscription?",
      icon: "pi pi-exclamation-triangle",
      accept: async () => deleteSubscription(),
    });
  };

  const deleteSubscription = async () => {
    setDeleteLoading(true);
    try {
      await axios.post("cancel-subscription");
      dispatch(
        setMessage(
          "Subscription cancelled. You will receive a confirmation email shortly."
        )
      );
      navigate("/");
    } catch (err) {
      toast.current.show({
        severity: "error",
        detail: err.response.data.error,
      });
    }
    setDeleteLoading(false);
  };

  return loading || loadingSubscription ? (
    <div
      className="loader-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: "9999",
      }}>
      <Toast ref={toast} />
      <RotateLoader
        sizeUnit={"px"}
        size={150}
        color={"#123abc"}
        loading={loading}
      />
    </div>
  ) : isAuthenticated && user && membership && membership.name !== "Free" ? (
    <UserLayout title="Subscription">
      <Toast ref={toast} />

      <div className="surface-0 p-card w-full md:w-8 md:mx-auto border-2 border-primary border-round my-5">
        <div className="font-medium text-3xl text-900 mb-3 p-2">
          My Subscription
        </div>
        <ul className="list-none p-0 m-0">
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Name</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              <Chip label={membership.name} className="bg-blue-900" />
              <i className="pi pi-money-bill text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Can create rooms</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              {membership.can_create_rooms ? (
                <Chip label="Yes" className="bg-blue-900" />
              ) : (
                <Chip label="No" className="bg-red-800" />
              )}
              <i className="pi pi-video text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Guest limit</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              <Chip label={membership.guest_limit} className="bg-blue-900" />
              <i className="pi pi-users text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Start date</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              {subscription?.start_date && (
                <Chip
                  label={new Date(
                    subscription.start_date * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  className="bg-blue-900"
                />
              )}
              <i className="pi pi-calendar text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Previous payment</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              {subscription?.current_period_start && (
                <Chip
                  label={new Date(
                    subscription.current_period_start * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  className="bg-blue-900"
                />
              )}
              <i className="pi pi-calendar text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Next payment</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              {subscription?.current_period_end && (
                <Chip
                  label={new Date(
                    subscription.current_period_end * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  className="bg-blue-900"
                />
              )}
              <i className="pi pi-calendar text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-4 font-medium">Payment amount</div>
            <div className="text-900 w-8 flex flex-row justify-content-between align-items-center">
              {subscription?.items && (
                <Chip
                  label={
                    subscription.items.data[0].price.unit_amount / 100 +
                    " " +
                    subscription.items.data[0].price.currency
                  }
                  className="bg-blue-900"
                />
              )}
              <i className="pi pi-dollar text-white text-2xl"></i>
            </div>
          </li>
          <li className="flex flex-column md:flex-row align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-full md:w-4 p-2 h-full">
              {historyPanel}
              <Button
                label="History"
                icon="pi pi-dollar"
                className="w-full h-full"
                tooltip="View payment history"
                tooltipOptions={{ position: "top" }}
                onClick={(e) => getPaymentHistory(e)}
                loading={paymentsLoading}
                disabled={paymentsLoading}
              />
            </div>
            <div className="text-500 w-full md:w-4 p-2 h-full">
              <Button
                label="Portal"
                icon="pi pi-user"
                className="w-full h-full"
                tooltip="Visit Stripe customer portal"
                tooltipOptions={{ position: "top" }}
                loading={portalLoading}
                disabled={portalLoading}
                onClick={() => openCustomerPortal()}
              />
            </div>
            <div className="text-500 w-full md:w-4 p-2 h-full">
              <Button
                label="Cancel"
                icon="pi pi-times"
                className="w-full h-full p-button-danger"
                tooltip="Cancel subscription"
                tooltipOptions={{ position: "top" }}
                loading={deleteLoading}
                disabled={deleteLoading}
                onClick={confirmDeletion}
              />
              <ConfirmPopup />
            </div>
          </li>
        </ul>
      </div>
    </UserLayout>
  ) : (
    <>
      <Toast ref={toast} />
    </>
  );
};

export default Subscription;
