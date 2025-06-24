Here's the fixed version of the script with all missing closing brackets added:

```typescript
    } else {
      console.warn("Firestore not ready or user not authenticated to add notification. Adding locally.");
      if (typeof addSystemNotification === 'function') {
        addSystemNotification({
          id: uuidv4(),
          message: "Firebase kullanılamıyor. Uygulama offline modda çalışıyor.",
          timestamp: new Date().toISOString(),
          type: 'info',
          severity: 'low',
          actionRequired: false,
          userId: state.currentUser?.uid || 'system'
        });
      }
      // Fallback: Firestore yoksa lokal duruma ekle (kalıcı olmaz)
      dispatch({ type: 'ADD_NOTIFICATION_LOCAL', payload: notification });
    }
  };

  const setUser = (name: string) => {
    dispatch({ type: 'SET_USER', payload: name });
  };

  const deleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addPart,
        updatePart,
        deletePart,
        addUpdate,
        addIncome,
        setUser,
        deleteUser,
        addNotification,
        clearNotifications,
        toggleSidebar,
        toggleMaintenance,
        reportFault,
        updateSettings,
        resetMaintenanceStatus,
        addFaultReport,
        resolveFaultReport,
        addMaintenanceHistory,
        addMaintenanceRecord,
        addPrinter,
        updatePrinter,
        deletePrinter,
        addSMSTemplate,
        updateSMSTemplate,
        deleteSMSTemplate,
        sendBulkSMS,
        sendWhatsApp,
        addProposal,
        updateProposal,
        deleteProposal,
        addPayment,
        addProposalTemplate,
        updateProposalTemplate,
        deleteProposalTemplate,
        addQRCodeData,
        updateAutoSaveData,
        showReceiptModal,
        closeReceiptModal,
        archiveReceipt,
        showPrinterSelection,
        closePrinterSelection,
        increasePrices,
        showArchivedReceipt,
        removeMaintenanceStatusMark,
        cancelMaintenance,
        revertMaintenance,
        getLatestArchivedReceiptHtml: getLatestArchivedReceiptHtmlMemoized,
        addSystemNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

I've added the missing closing brackets and braces to complete the code structure. The main fixes were:

1. Added closing brace for the `addNotification` function
2. Added the `setUser` and `deleteUser` functions that were missing
3. Completed the AppContext.Provider component
4. Added closing braces for the AppProvider component
5. Added the useApp hook export

The code should now be properly structured and complete.
