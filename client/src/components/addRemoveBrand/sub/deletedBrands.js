import React, { Component, Fragment } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-responsive-modal';

import { connect } from 'react-redux';
import { updateBrand, activateBrand, initializeAll } from '../../../actions';

export class DeletedBrands extends Component {
    constructor(props) {
        super(props)
        this.state = {
            checkedValues: [],
            myData: [],
            open: false,
            brandName: "",
            brandPicture: "",
            currentId: "",
            file: "",
        }
        
        //Dropzone constants & methods
        this.dropzone = null;
        this.files = [];

        this.djsConfig = {
            addRemoveLinks: true,
            acceptedFiles: "image/jpeg,image/png,image/gif",
            maxFiles: 1
        };
   
        this.dropzoneComponentConfig = {
            iconFiletypes: ['.jpg', '.png', '.gif'],
            showFiletypeIcon: true,
            postUrl: '/',
        };
          
        this.callbackArray = [() => console.log('Hi!'), () => console.log('Ho!')];
        this.callback = (e) => {this.files.push(e);};
        this.success = file => console.log('uploaded', file);
        this.removedfile = file => {
            for(let i = 0 ; i < this.files.length ; i ++ ) {
                if(this.files[i] === file) {
                    this.files.splice(i, 1);
                    break;
                }
            }
        }
    }

    componentWillMount(){
        let data = [];
        let index = 0;
        this.props.deletedBrands.map(brand => {
            if(!brand.allow) {
                let oneBrand = {
                    index: ++ index,
                    image: <img src={`${process.env.PUBLIC_URL}/assets/images/brands/${brand.picture}`} style={{width: 'auto', height: '50px',  marginLeft: 'auto', marginRight: 'auto'}} placeholder={"Brand picture"} />,
                    name: brand.name
                }
                data.push(oneBrand);
            }
        });
        this.setState({
            myData: data
        })
    }

    selectRow = (e, i) => {
        if (!e.target.checked) {
            this.setState({
                checkedValues: this.state.checkedValues.filter((item, j) => i !== item)
            });
        } else {
            this.state.checkedValues.push(i);
            this.setState({
                checkedValues: this.state.checkedValues
            })
        }
    }

    handleRemoveRow = () => {
        const selectedValues = this.state.checkedValues;
        const updatedData = this.state.myData.filter(function (el) {
            return selectedValues.indexOf(el.id) < 0;
        });
        this.setState({
            myData: updatedData
        })
        toast.success("Successfully Deleted !")
    };

    renderEditable = (cellInfo) => {
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.myData];
                    data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                    this.setState({ myData: data });
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.myData[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    }

    Capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    save = async (e) => {

        this.props.initializeAll();
        
        if(this.state.brandName === "") {
            toast.error("Before making current brand changes, please type new brand name.");
            return;
        }

        let pictureUrl = "";
        if(this.uploadInput.files.length === 0 ) {
            pictureUrl = this.state.brandPicture;
        } else {
            pictureUrl = this.uploadInput.files[0].name;
        }

        let brandObj = {
            _id: this.state.currentId,
            name: this.state.brandName,
            picture: pictureUrl,
            allow: false,
        }
        var myJSON = JSON.stringify(brandObj)
        let data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        data.append('fileName', pictureUrl);
        data.append('product',myJSON);
        await this.props.updateBrand(data);

        this.setState({
            open: false,
            brandName: "",
            brandPicture: "",
            currentId: "",
            files: ""
        })

    }

    cancel = (e) => {
        this.setState({
            open: false,
            brandName: "",
            brandPicture: "",
            currentId: "",
            files: ""
        })
        this.props.initializeAll();
    }

    handleFileChange = (event) => {
        this.setState({
            file: event.target.files[0] !== undefined
                    ? URL.createObjectURL(event.target.files[0])
                    : ""
        })
    }

    render() {
        const { pageSize, myClass, pagination } = this.props;
        const { myData } = this.state

        const columns = [];

        const widthList = [ 60, 270, 230];
        let index = 0;

        const { open } = this.state;

        ["index", "image", "name"].map(key=> {
            columns.push({
                accessor: key,
                Cell: null,
                style: {
                    textAlign: key === 'index'? 'center' : 'left',
                    padding: 0
                },
                maxWidth: widthList[index]
            });

            index ++;
        })

        index = 0;

        let tableData = [];
        this.props.deletedBrands.map(brand => {
            if(!brand.allow) {
                let oneBrand = {
                    index: ++ index,
                    image: <img src={`${process.env.PUBLIC_URL}/assets/images/brands/${brand.picture}`} style={{width: 'auto', height: '50px',  marginLeft: 'auto', marginRight: 'auto'}} placeholder={"Brand picture"} />,
                    name: brand.name
                }
                tableData.push(oneBrand);
            }
        });

        columns.push(
            {
                id: 'action',
                accessor: str => "action",
                Cell: (row) => (
                    <div>
                        <span
                            onClick={() => {
                                this.setState({
                                    currentId: this.props.deletedBrands[row.index]._id,
                                    brandName: this.props.deletedBrands[row.index].name,
                                    brandPicture: this.props.deletedBrands[row.index].picture,
                                })

                                this.onOpenModal();
                            }}
                        >
                            <i className="fa fa-pencil" style={{ width: 35, fontSize: 20, padding: 11,color:'rgb(40, 167, 69)', cursor: 'pointer' }} />
                        </span>

                        <span
                            onClick={() => {
                                if (window.confirm('Are you sure you wish to activate this brand?')) {

                                    this.props.activateBrand(this.props.deletedBrands[row.index]._id);
                                }
                            }}
                            style={{backgroundColor: 'rgb(0, 164, 228)', color: 'white', marginRight: '5px', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Activate
                        </span>

                    </div>
            ),
            style: {
                textAlign: 'center'
            },
            sortable: false,
            width: 150
        })

        // For a list of all possible events (there are many), for dropzone component.
        const eventHandlers = {
            init: dz => this.dropzone = dz,
            drop: this.callbackArray,
            addedfile: this.callback,
            success: this.success,
            removedfile: this.removedfile
        }

        return (
            <Fragment>
                <ReactTable
                    TheadComponent={_ => null}
                    data={tableData}
                    columns={columns}
                    defaultPageSize={pageSize}
                    className={myClass}
                    showPagination={pagination}
                />
                <Modal open={open} onClose={this.cancel} >
                <div className="modal-header">
                        <h5 className="modal-title f-w-600" id="exampleModalLabel2">Edit Brand</h5>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label htmlFor="recipient-name" className="col-form-label" >Brand Name :</label>
                                <input type="text" className="form-control" name="brandName" value={this.state.brandName} onChange={this.onChange} />
                            </div>

                            {this.state.file !== "" ?
                                <div className="form-group">                                                              
                                    <img className="form-control" src={this.state.file} style={{width: 300, height: 'auto', marginLeft: 'auto', marginRight: 'auto'}} />
                                </div>
                                :
                                <div className="form-group row">                                                              
                                    <img src={`${process.env.PUBLIC_URL}/assets/images/brands/${this.state.brandPicture}`} style={{width:300,height:'auto', marginRight: 'auto', marginLeft: 'auto'}} placeholder={"Item picture"} />
                                </div>
                            }
                            <div className="form-group">                                                              
                                <input className="form-control" ref={(ref) => { this.uploadInput = ref; }} type="file" onChange={this.handleFileChange} required={true}/>
                            </div>

                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={this.save}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={this.cancel}>Close</button>
                    </div>
                </Modal>

                <ToastContainer />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    unknown_error: state.currentStatus.unknown_error,
    deletedBrands: state.brand.deletedBrands
});

export default connect(
    mapStateToProps,
    { updateBrand, activateBrand, initializeAll }
)(DeletedBrands);