// Machine generated IDispatch wrapper class(es) created with Add Class from Typelib Wizard

// CCustomProperty wrapper class

class CCustomProperty : public COleDispatchDriver
{
public:
	CCustomProperty(){} // Calls COleDispatchDriver default constructor
	CCustomProperty(LPDISPATCH pDispatch) : COleDispatchDriver(pDispatch) {}
	CCustomProperty(const CCustomProperty& dispatchSrc) : COleDispatchDriver(dispatchSrc) {}

	// Attributes
public:

	// Operations
public:


	// CustomProperty methods
public:
	CString get_Name()
	{
		CString result;
		InvokeHelper(0x1, DISPATCH_PROPERTYGET, VT_BSTR, (void*)&result, NULL);
		return result;
	}
	CString get_Value()
	{
		CString result;
		InvokeHelper(0x0, DISPATCH_PROPERTYGET, VT_BSTR, (void*)&result, NULL);
		return result;
	}
	void put_Value(LPCTSTR newValue)
	{
		static BYTE parms[] = VTS_BSTR ;
		InvokeHelper(0x0, DISPATCH_PROPERTYPUT, VT_EMPTY, NULL, parms, newValue);
	}
	void Delete()
	{
		InvokeHelper(0x2, DISPATCH_METHOD, VT_EMPTY, NULL, NULL);
	}

	// CustomProperty properties
public:

};
