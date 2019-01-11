import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import azure from 'azure-storage'
import Button from '../../../atoms/Button'
import Spinner from '../../../atoms/Spinner'
import { storageAccount, accessKey } from '../../../../../config/cloudStorage'

import styles from './Picker.module.scss'

export default class CloudStoragePicker extends PureComponent {
    static propTypes = {
        linkSetter: PropTypes.func.isRequired,
        handleCloseModal: PropTypes.func.isRequired
    }

    state = {
        selection: [],
        loading: false
    }

    componentDidMount() {
        this.setState({ loading: true })
        // this.props.loadCloudFiles()
        // TODO load cloud files, loading to false when done
    }

    handleSelection(blobId) {
        if (this.state.selection.includes(blobId)) {
            this.setState({ selection: this.state.selection.filter(bId => bId !== blobId) })
        } else {
            this.setState(prevState => ({
                selection: [...prevState.selection, blobId]
            }))
        }
    }

    submitSelection() {
        /*
        const selectionWithData = []
        for (const e of this.state.selection) {
            selectionWithData.push(this.props.blobs[e])
        }
        const blobService = azure.createBlobService(storageAccount, accessKey)
        const timeout = (new Date().getTime()) + 3600 * 24 * 30 // 12 hours
        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
                Expiry: timeout
            }
        }
        const firstBlob = selectionWithData[0]
        const token = blobService.generateSharedAccessSignature(firstBlob.container, firstBlob.blobName, sharedAccessPolicy)
        const sasUrl = blobService.getUrl(firstBlob.container, firstBlob.blobName, token)
        this.props.linkSetter(sasUrl)
        this.props.handleCloseModal()
        */
    }

    render() {
        return (
            <>
                <div className={styles.files}>
                    {
                        blobs === undefined || blobs.length === 0 ? (
                            <div className={styles.empty}>
                                {this.state.loading ? <Spinner />
                                    : error
                                        ? <span className={styles.error}>{error}</span>
                                        : <span>No files found</span>
                                }
                            </div>
                        ) : (
                            blobs.map(blob => (
                                <span
                                    key={blob.id}
                                    onClick={() => this.handleSelection(blob.id)}
                                    className={this.state.selection.includes(blob.id) ? styles.selected : styles.file}
                                >
                                    {blob.container}/{blob.blobName}
                                </span>
                            ))
                        )
                    }
                </div>
                <div className={styles.listSubmit}>
                    <Button
                        primary="true"
                        type="submit"
                        onClick={() => this.submitSelection()}>
                        Submit
                    </Button>
                </div>
            </>
        )
    }
}
