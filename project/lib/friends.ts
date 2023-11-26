import { DocumentData, Query, QueryCompositeFilterConstraint, QueryConstraint, QueryFieldFilterConstraint, and, collection, deleteDoc, doc, getDoc, getDocs, or, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Sends a friend request
 * @param send_uid UID string of sender (must match document id in users)
 * @param recv_uid UID string of recipient (must match document id in users)
 * @param send_username (optional) username of sender. Fetched if not provided.
 * @param recv_username (optional) username of recipient. Fetched if not provided.
 * @returns 0 on success, 1 on sender not existing, 2 on recipient not existing, 3 if invite already exists
 */
export async function sendFriendRequest(send_uid: string, recv_uid: string, send_username: string = "", recv_username: string = "") {
    
    // get sender document if no username provided
    if (send_username == "") {
        const sendDoc = doc(db, "users", send_uid);
        const sendSnap = await getDoc(sendDoc);
        if (!sendSnap.exists()) {
            console.warn(`Sender document with id ${send_uid} doesn't exist!`);
            return 1;
        }
        const sendData = sendSnap.data();
        send_username = sendData.username as string;
    }
    
    // get recipient document if no username provided
    if (recv_username == "") {
        const recvDoc = doc(db, "users", recv_uid);
        const recvSnap = await getDoc(recvDoc);
        if (!recvSnap.exists()) {
            console.warn(`Recipient document with id ${recv_uid} doesn't exist!`);
            return 2;
        }
        const recvData = recvSnap.data();
        recv_username = recvData.username as string;
    }
    
    // create invitation
    const invID = send_uid < recv_uid ?
        `${send_uid}_${recv_uid}` :
        `${recv_uid}_${send_uid}`;
    const invDoc = doc(db, 'friends', invID);
    const invSnap = await getDoc(invDoc);
    if (invSnap.exists()) {
        console.log(`Invitation already exists!`);
        return 3;
    }

    const data = {
        senderId: send_uid,
        receiverId: recv_uid,
        senderName: send_username,
        receiverName: recv_username,
        status: 'pending'
    };
    await setDoc(invDoc, data);

    return 0; // Success   
}

export async function acceptFriendRequest(inv_id: string) {
    const invDoc = doc(db, "friends", inv_id);
    const invSnap = await getDoc(invDoc);
    const invData = invSnap.data();

    // update invitation
    await updateDoc(invDoc, { status: "accepted "});
}

export async function declineFriendRequest(inv_id: string) {
    const invDoc = doc(db, "friends", inv_id);
    await deleteDoc(invDoc);
}

/**
 * Gets a list of friend UIDs of a user
 * @param uid UID of user to get friends of 
 * @returns list of friend UIDs
 */
export async function getAcceptedFriends(uid: string) {
    const invRef = collection(db, "friends");
    const filter = and(
        or(
            where("senderId",'==',uid),
            where("receiverId",'==',uid)
        ),
        where("status",'==',"accepted")
    );
    const q = query(invRef, filter);
    const qSnap = await getDocs(q);

    const result = [] as string[];
    qSnap.forEach(d => {
        const data = d.data();
        if (data.senderId != uid) {
            result.push(data.senderId)
        }
        else {
            result.push(data.receiverId);
        }
    });

    return result;
}

/**
 * Gets posts made by friends (descending by modified date)
 * @param uid UID of the active user
 * @param from (optional) "class" or "professor" if also filtering by one of those
 * @param obj_id (optional) Firestore id of the class or professor to filter by
 * @returns List of posts (w/ data) made by that user's friends and the user themselves
 */
export async function getFriendPosts(uid: string, from: string = "", obj_id: string = "") {
    const friendList = await getAcceptedFriends(uid);
    friendList.push(uid); // add self to "friends" so you grab your own posts as well

    const colRef = collection(db, "posts");

    const result: any[] = [];
    friendList.forEach(async f => {
        let fltr : QueryCompositeFilterConstraint | QueryFieldFilterConstraint = where("uid",'==',f);
        if (from == "class") {
            fltr = and(
                where("uid",'==',f), where("class",'==',obj_id)
            );
        }   
        else if (from == "professor") {
            fltr = and(
                where("uid",'==',f), where("professor",'==',obj_id)
            );
        }

        const q = query(colRef, fltr as QueryConstraint, orderBy("modifiedAt","desc"));
        const qSnap = await getDocs(q);
        qSnap.forEach(d => {
            result.push({
                ...d.data(),
                id: d.id
            })
        });
    });

    console.log(result);
    
    return result;
}
